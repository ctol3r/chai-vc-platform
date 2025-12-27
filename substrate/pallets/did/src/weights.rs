#![allow(unused_imports)]
use frame_support::weights::Weight;

pub trait WeightInfo {
    fn create(_did_len: u32) -> Weight;
    fn add_key(_did_len: u32, _key_type_len: u32, _pk_len: u32) -> Weight;
    fn remove_key(_did_len: u32, _key_type_len: u32) -> Weight;
    fn add_service(_did_len: u32, _uri_len: u32) -> Weight;
    fn remove_service(_did_len: u32) -> Weight;
    fn deactivate(_did_len: u32) -> Weight;
}

impl WeightInfo for () {
    fn create(_did_len: u32) -> Weight { Weight::from_parts(10_000, 0) }
    fn add_key(_did_len: u32, _key_type_len: u32, _pk_len: u32) -> Weight { Weight::from_parts(10_000, 0) }
    fn remove_key(_did_len: u32, _key_type_len: u32) -> Weight { Weight::from_parts(10_000, 0) }
    fn add_service(_did_len: u32, _uri_len: u32) -> Weight { Weight::from_parts(10_000, 0) }
    fn remove_service(_did_len: u32) -> Weight { Weight::from_parts(10_000, 0) }
    fn deactivate(_did_len: u32) -> Weight { Weight::from_parts(10_000, 0) }
}

