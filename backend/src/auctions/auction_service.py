import uuid
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from typing import Dict, Optional, List

@dataclass
class Bid:
    recruiter_id: str
    amount: float
    timestamp: datetime = field(default_factory=datetime.utcnow)

@dataclass
class Auction:
    id: str
    candidate_id: str
    end_time: datetime
    highest_bid: Bid
    bids: List[Bid] = field(default_factory=list)
    active: bool = True

class AuctionService:
    """Simple in-memory auction service for recruiter bidding."""

    def __init__(self) -> None:
        self.auctions: Dict[str, Auction] = {}

    def start_auction(self, candidate_id: str, starting_bid: float, duration_minutes: int = 60) -> str:
        auction_id = str(uuid.uuid4())
        end_time = datetime.utcnow() + timedelta(minutes=duration_minutes)
        starting = Bid(recruiter_id="system", amount=starting_bid)
        auction = Auction(
            id=auction_id,
            candidate_id=candidate_id,
            end_time=end_time,
            highest_bid=starting,
            bids=[starting],
        )
        self.auctions[auction_id] = auction
        return auction_id

    def place_bid(self, auction_id: str, recruiter_id: str, amount: float) -> None:
        if auction_id not in self.auctions:
            raise ValueError("Auction not found")
        auction = self.auctions[auction_id]
        if not auction.active or datetime.utcnow() >= auction.end_time:
            raise ValueError("Auction already closed")
        if amount <= auction.highest_bid.amount:
            raise ValueError("Bid must be higher than current highest bid")
        bid = Bid(recruiter_id=recruiter_id, amount=amount)
        auction.bids.append(bid)
        auction.highest_bid = bid

    def close_auction(self, auction_id: str) -> Auction:
        if auction_id not in self.auctions:
            raise ValueError("Auction not found")
        auction = self.auctions[auction_id]
        auction.active = False
        return auction

    def get_highest_bid(self, auction_id: str) -> Bid:
        if auction_id not in self.auctions:
            raise ValueError("Auction not found")
        return self.auctions[auction_id].highest_bid
