from chains.copilot_agent_chain import copilot_agent
from langchain_core.messages import ToolMessage

async def copilot_service(
    prompt: str,
    resume_id: int | None = None,
    job_description: str | None = None,
    location: str | None = None
):

    full_prompt = f"""
    User Request:
    {prompt}

    Resume ID:
    {resume_id}

    Job Description:
    {job_description}

    Location:
    {location}
    """

    result = await copilot_agent.ainvoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": full_prompt
                }
            ]
        }
    )

    print(result)
    tool_output = None

    outputs = []

    for message in result["messages"]:

        if isinstance(message, ToolMessage):

            outputs.append(
                {
                    "tool": message.name,
                    "result": message.content
                }
            )
    return {
        "response":
        outputs
    }