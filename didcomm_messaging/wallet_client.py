#!/usr/bin/env python3
"""CLI client for DIDComm prototype server."""

import argparse
import json
from urllib import request, parse


def send_message(server_url: str, sender: str, recipient: str, body: str, msg_type: str = "message"):
    data = json.dumps({
        "from": sender,
        "to": recipient,
        "type": msg_type,
        "body": body,
    }).encode()
    req = request.Request(parse.urljoin(server_url, "/send"), data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    with request.urlopen(req) as resp:
        return json.loads(resp.read())


def fetch_messages(server_url: str, wallet_id: str):
    url = parse.urljoin(server_url, f"/messages?wallet_id={parse.quote(wallet_id)}")
    with request.urlopen(url) as resp:
        return json.loads(resp.read())


def main():
    parser = argparse.ArgumentParser(description="DIDComm wallet client")
    parser.add_argument("server", help="Base URL of DIDComm server, e.g. http://localhost:8000")
    subparsers = parser.add_subparsers(dest="command", required=True)

    send_p = subparsers.add_parser("send", help="Send a message")
    send_p.add_argument("sender")
    send_p.add_argument("recipient")
    send_p.add_argument("body")
    send_p.add_argument("--type", default="message")

    recv_p = subparsers.add_parser("recv", help="Fetch messages for wallet")
    recv_p.add_argument("wallet_id")

    args = parser.parse_args()

    if args.command == "send":
        result = send_message(args.server, args.sender, args.recipient, args.body, args.type)
        print(json.dumps(result, indent=2))
    elif args.command == "recv":
        result = fetch_messages(args.server, args.wallet_id)
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
