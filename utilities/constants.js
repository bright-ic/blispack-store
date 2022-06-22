
exports.error_messages = {
    "invalid_object_id": {"_invalid_object_id": "Invalid object Id Supplied"},
    "server_error": {"_server_error": "Internal server error occurred"},
    "db_error": {"_db_error": "DB error occurred"},
    "missing_params": {"_missing_params": 'Required parameters are missing in your request'},
};

exports.supported_payment_gateways = {
    stripe: {name: 'stripe'}
}