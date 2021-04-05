import {Message, Stan} from "node-nats-streaming";
import {Subjects} from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

// abstract class
export abstract class Listener<T extends Event> {
  abstract subject: T["subject"];
  abstract queueGroupName: string;
  abstract onMessage(data: T["data"], msg: Message): void;
  // private client: Stan;
  protected client: Stan;
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client
      // Returns a SubscriptionOptions initialized to defaults
      .subscriptionOptions()
      // Configures the subscription to replay from first available message
      .setDeliverAllAvailable()
      // Configures the subscription to require manual acknowledgement of messages using Message#acknowledge
      .setManualAckMode(true)
      //Sets the number of milliseconds before a message is considered unacknowledged by the streaming server
      .setAckWait(this.ackWait)
      // Sets a durable subscription name that the client can specify for the subscription. This enables the subscriber to close the connection without canceling the subscription and resume the subscription with same durable name. Note the server will resume the subscription with messages that have not been acknowledged.
      .setDurableName('accounting-service');
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    )

    subscription.on("message", (msg: Message) => {
      console.log(`
        Message recieved: ${this.subject} / ${this.queueGroupName}
      `)

      const parseData = this.parseMessage(msg);
      this.onMessage(parseData, msg);
    })
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf8"));
  }
}