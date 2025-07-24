import pytest
from backend.src.auctions.auction_service import AuctionService


def test_auction_flow():
    service = AuctionService()
    auction_id = service.start_auction("cand-1", starting_bid=10.0, duration_minutes=1)

    # place a higher bid
    service.place_bid(auction_id, "recruiterA", 15.0)
    assert service.get_highest_bid(auction_id).amount == 15.0
    assert service.get_highest_bid(auction_id).recruiter_id == "recruiterA"

    # closing auction should mark it inactive
    auction = service.close_auction(auction_id)
    assert not auction.active


def test_reject_lower_bid():
    service = AuctionService()
    auction_id = service.start_auction("cand-2", starting_bid=5.0, duration_minutes=1)
    with pytest.raises(ValueError):
        service.place_bid(auction_id, "recruiterB", 4.0)
