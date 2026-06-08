const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL;

const getHeaders = () => {

    return {
        "Content-Type": "application/json",
    };

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
