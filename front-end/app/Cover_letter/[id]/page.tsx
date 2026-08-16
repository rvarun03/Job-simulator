import CoverLetterWorkspace from "../../components/CoverLetterWorkspace";

export default async function CoverLetterByResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CoverLetterWorkspace initialResumeId={Number(id)} lockResumeId />;
}
