const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL;

const getHeaders = () => {

    return {
        "Content-Type": "application/json",
    };

};

export type UserRole = "USER" | "HR";

export type TokenResponse = {
    access_token: string;
    token_type: string;
    role: UserRole;
};

export type AuthSession = {
    accessToken: string;
    tokenType: string;
    role: UserRole;
};

export type CandidateRankResponse = {
    rank: number;
    candidate_name: string;
    resume_filename: string;
    final_score: number;
    ai_score: number;
    tfidf_score: number;
    skill_match_score: number;
    matching_skills: string[];
    missing_skills: string[];
    strengths: string[];
    concerns: string[];
    summary: string;
};

export const AUTH_SESSION_CHANGED_EVENT = "auth-session-change";

const AUTH_STORAGE_KEYS = {
    accessToken: "access_token",
    tokenType: "token_type",
    userRole: "user_role",
};

const isUserRole = (value: string | null): value is UserRole => (
    value === "USER" || value === "HR"
);

const notifyAuthSessionChanged = () => {
    if (typeof window === "undefined") {
        return;
    }

    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
};

export const getAuthSessionSnapshot = () => {
    if (typeof window === "undefined") {
        return "";
    }

    return JSON.stringify({
        accessToken: window.localStorage.getItem(AUTH_STORAGE_KEYS.accessToken),
        tokenType: window.localStorage.getItem(AUTH_STORAGE_KEYS.tokenType) || "bearer",
        role: window.localStorage.getItem(AUTH_STORAGE_KEYS.userRole),
    });
};

export const getServerAuthSessionSnapshot = () => "";

export const getAuthSessionFromSnapshot = (
    snapshot: string
): AuthSession | null => {
    if (!snapshot) {
        return null;
    }

    try {
        const data = JSON.parse(snapshot) as {
            accessToken?: unknown;
            tokenType?: unknown;
            role?: unknown;
        };

        const accessToken = typeof data.accessToken === "string"
            ? data.accessToken
            : "";
        const tokenType = typeof data.tokenType === "string" && data.tokenType
            ? data.tokenType
            : "bearer";
        const role = typeof data.role === "string" ? data.role : null;

        if (!accessToken || !isUserRole(role)) {
            return null;
        }

        return {
            accessToken,
            tokenType,
            role,
        };
    } catch {
        return null;
    }
};

export const getAuthSession = (): AuthSession | null => {
    return getAuthSessionFromSnapshot(getAuthSessionSnapshot());
};

export const subscribeToAuthSession = (callback: () => void) => {
    if (typeof window === "undefined") {
        return () => {};
    }

    window.addEventListener("storage", callback);
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, callback);

    return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, callback);
    };
};

export const saveAuthSession = (session: TokenResponse) => {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(
        AUTH_STORAGE_KEYS.accessToken,
        session.access_token
    );
    window.localStorage.setItem(
        AUTH_STORAGE_KEYS.tokenType,
        session.token_type || "bearer"
    );
    window.localStorage.setItem(
        AUTH_STORAGE_KEYS.userRole,
        session.role
    );

    notifyAuthSessionChanged();
};

export const clearAuthSession = () => {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.tokenType);
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.userRole);

    notifyAuthSessionChanged();
};

const getErrorMessage = async (
    res: Response,
    fallback: string
) => {
    try {
        const data = await res.json() as {
            detail?: string | Array<{ msg?: string }>;
        };

        if (typeof data?.detail === "string") {
            return data.detail;
        }

        if (Array.isArray(data?.detail)) {
            return data.detail
                .map((item) => item?.msg)
                .filter(Boolean)
                .join(", ") || fallback;
        }
    } catch {
        return fallback;
    }

    return fallback;
};

const withOptionalResumeId = (
    resume_id: number | undefined,
    data: Record<string, string>
) => ({
    ...(resume_id ? { resume_id } : {}),
    ...data,
});

const parsePythonDictString = (value: string) => {
    const getStringField = (key: string) => {
        const match = value.match(new RegExp(`'${key}'\\s*:\\s*'((?:\\\\.|[^'])*)'`));
        return match?.[1]?.replace(/\\'/g, "'").replace(/\\"/g, "\"");
    };

    return {
        subject: getStringField("subject"),
        cover_letter: getStringField("cover_letter"),
    };
};

const normalizeCoverLetterResponse = (data: unknown) => {
    if (typeof data !== "string") {
        return data;
    }

    try {
        return JSON.parse(data);
    } catch {
        return parsePythonDictString(data);
    }
};

export const api = {

    register: async (
        name: string,
        email: string,
        password: string,
        role: UserRole
    ): Promise<TokenResponse> => {
        const res = await fetch(
            `${BASE_URL}/auth/register`,
            {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role,
                }),
            }
        );

        if (!res.ok) {
            throw new Error(
                await getErrorMessage(
                    res,
                    "Failed to register account"
                )
            );
        }

        return res.json();
    },

    login: async (
        email: string,
        password: string
    ): Promise<TokenResponse> => {
        const res = await fetch(
            `${BASE_URL}/auth/login`,
            {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    email,
                    password,
                }),
            }
        );

        if (!res.ok) {
            throw new Error(
                await getErrorMessage(
                    res,
                    "Failed to login"
                )
            );
        }

        return res.json();
    },

    rankCandidates: async (
        job_description: string,
        resumes: File[]
    ): Promise<CandidateRankResponse[]> => {
        const formData = new FormData();
        formData.append("job_description", job_description);

        resumes.forEach((resume) => {
            formData.append("resumes", resume);
        });

        const res = await fetch(
            `${BASE_URL}/hr/candidates/rank`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!res.ok) {
            throw new Error(
                await getErrorMessage(
                    res,
                    "Failed to rank candidates"
                )
            );
        }

        return res.json();
    },

    matchJob: async (
        resume_id: number | undefined,
        job_description: string
    ) => {

        const res = await fetch(
            `${BASE_URL}/match/`,
            {
                method: "POST",

                headers: getHeaders(),

                body: JSON.stringify(withOptionalResumeId(
                    resume_id,
                    { job_description }
                )),
            }
        );

        if (!res.ok) {
            throw new Error(
                "Failed to analyze ATS match"
            );
        }

        return res.json();

    },

    generateResumeImprovements: async (
        resume_id: number | undefined,
        job_description: string
    ) => {

        const res = await fetch(
            `${BASE_URL}/resume-improvement/generate`,
            {
                method: "POST",

                headers: getHeaders(),

                body: JSON.stringify(withOptionalResumeId(
                    resume_id,
                    { job_description }
                )),
            }
        );

        if (!res.ok) {

            throw new Error(
                "Failed to generate resume improvements"
            );

        }

        return res.json();

    },

    generateCoverLetter: async (
        resume_id: number | undefined,
        job_description: string
    ) => {

        const res = await fetch(
        `${BASE_URL}/cover-letter/generate`,
        {
            method: "POST",

            headers: getHeaders(),

            body: JSON.stringify(withOptionalResumeId(
            resume_id,
            { job_description }
            )),
        }
        );

        if (!res.ok) {
        throw new Error(
            "Failed to generate cover letter"
        );
        }

        const data = await res.json();
        return normalizeCoverLetterResponse(data);
    },

    uploadResume: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${BASE_URL}/resume/upload`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            throw new Error("Failed to upload resume");
        }

        return res.json();
    },

    askQuestion: async (resume_id: number | undefined, question: string) => {
        const body = JSON.stringify(withOptionalResumeId(resume_id, { question }));
        
        console.log("URL:", `${BASE_URL}/chat/ask`);
        console.log("Body:", body);  // Make sure this looks right
        
        const res = await fetch(`${BASE_URL}/chat/ask`, {
            method: "POST",
            headers: getHeaders(),
            body,
        });

        if (!res.ok) {
            const err = await res.json();
            console.error("422 detail:", err); // This tells you EXACTLY what field is wrong
            throw new Error("Failed");
        }

        return res.json();
    }

};
