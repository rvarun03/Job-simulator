from typing import Dict
from fastapi import WebSocket


class ConnectionManager:

    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, resume_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[resume_id] = websocket

    def disconnect(self, resume_id: int, websocket: WebSocket | None = None):
        active_websocket = self.active_connections.get(resume_id)

        if websocket is None or active_websocket == websocket:
            self.active_connections.pop(resume_id, None)

    async def send(self, resume_id: int, message: dict):

        ws = self.active_connections.get(resume_id)

        if ws:
            await ws.send_json(message)


manager = ConnectionManager()
