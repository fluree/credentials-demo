export default [
    {
        "_id": "_collection",
        "name": "university"
    },
    {
        "_id": "_collection",
        "name": "certificate"
    },
    {
        "_id": "_collection",
        "name": "verificationOrg"
    },
    {
        "_id": "_collection",
        "name": "user"
    },
    {
        "_id": "_predicate",
        "name": "certificate/date",
        "type": "instant"
    },
    {
        "_id": "_predicate",
        "name": "certificate/hash",
        "doc": "SHA256 of the transcript PDF",
        "type": "string",
        "index": true
    },
    {
        "_id": "_predicate",
        "name": "certificate/university",
        "type": "ref",
        "restrictCollection": "university"
    },
    {
        "_id": "_predicate",
        "name": "university/name",
        "type": "string"
    },
    {
        "_id": "_predicate",
        "name": "verificationOrg/name",
        "type": "string",
        "unique": true
    },
    {
        "_id": "_predicate",
        "name": "verificationOrg/applicants",
        "type": "ref",
        "multi": true,
        "restrictCollection": "user"
    },
    {
        "_id": "_predicate",
        "name": "user/lastName",
        "type": "string"
    },
    {
        "_id": "_predicate",
        "name": "user/firstName",
        "type": "string"
    },
    {
        "_id": "_predicate",
        "name": "user/verificationStatus",
        "type": "tag",
        "doc": "Should resolve to Unverified, Rejected, or Verified"
    }
]