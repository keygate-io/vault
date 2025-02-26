


thread_local! {
    pub static KEY_NAME : std::cell::RefCell<String> = std::cell::RefCell::new("dfx_test_key".to_string());
}

#[ic_cdk::update]
pub async fn get_public_key() -> Result<evm_types::PublicKeyReply, String> {
    let signer = alloy_services::create_icp_sepolia_signer().await;
    let public_key = signer.public_key().to_vec();
    Ok(evm_types::PublicKeyReply { public_key })
}