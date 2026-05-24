from fastapi import APIRouter, WebSocket
from core.ws_manager import manager

router = APIRouter()

router = APIRouter(prefix="/ws", tags=["Web Socket"])

@router.websocket("/{resume_id}")
async def ws_endpoint(websocket: WebSocket, resume_id: int):

    await manager.connect(resume_id, websocket)

    try:
        while True:
            await websocket.receive_text()  # keep alive

    except:
        manager.disconnect(resume_id, websocket)
