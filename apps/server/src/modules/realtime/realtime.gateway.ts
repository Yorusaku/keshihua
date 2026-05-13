import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { JwtService } from "@nestjs/jwt";
import { Injectable } from "@nestjs/common";
import * as WebSocket from "ws";
import { IncomingMessage } from "http";

@Injectable()
@WebSocketGateway({ path: "/ws" })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: WebSocket.Server;

  private connectionsCount = 0;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: WebSocket, request: IncomingMessage) {
    try {
      const url = new URL(request.url || "", "http://localhost");
      const token = url.searchParams.get("token");
      if (!token) {
        client.close(4001, "Unauthorized");
        return;
      }
      const payload = this.jwtService.verify(token);
      (client as any).userId = payload.sub;
      (client as any).username = payload.username;

      client.on("message", (raw: WebSocket.Data) => {
        let message: any;
        try {
          message = JSON.parse(raw.toString());
        } catch {
          return;
        }

        if (!message || typeof message !== "object" || typeof message.topic !== "string") {
          return;
        }

        if (message.topic === "ping") {
          client.send(JSON.stringify({
            messageId: `pong-${Date.now()}`,
            topic: "pong",
            sourceId: "realtime-server",
            timestamp: Date.now(),
            payload: { serverTime: Date.now(), echoMessageId: message.messageId },
          }));
          return;
        }

        const allowedTopics = ["agv.created", "alert.assigned", "alert.updated", "alert.closed"];
        if (allowedTopics.includes(message.topic)) {
          this.broadcast(JSON.stringify(message), client);
        }
      });

      this.connectionsCount++;
      console.log(`[realtime] client connected: ${payload.username} (total: ${this.connectionsCount})`);
    } catch {
      client.close(4001, "Unauthorized");
    }
  }

  handleDisconnect(_client: WebSocket) {
    this.connectionsCount--;
    console.log(`[realtime] client disconnected (total: ${this.connectionsCount})`);
  }

  public broadcast(raw: string, from?: WebSocket) {
    this.server.clients.forEach((client: WebSocket) => {
      if (client !== from && client.readyState === WebSocket.OPEN) {
        client.send(raw);
      }
    });
  }

  broadcastAlert(topic: string, data: any) {
    const envelope = {
      messageId: `alert-${Date.now()}`,
      topic,
      sourceId: "realtime-server",
      timestamp: Date.now(),
      payload: data,
    };
    const raw = JSON.stringify(envelope);
    this.server.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(raw);
      }
    });
  }

  broadcastAgvCreated(agv: any) {
    const envelope = {
      messageId: `agv-${Date.now()}`,
      topic: "agv.created",
      sourceId: "realtime-server",
      timestamp: Date.now(),
      payload: agv,
    };
    const raw = JSON.stringify(envelope);
    this.server.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(raw);
      }
    });
  }
}
