export default [
    {
        "_id": "_auth$validAuth",
        "id": "238075031ValidAuthID"
    },
    {
        "_id": "_auth$invalidAuth",
        "id": "238075031InvalidAuthID"
    },
    {
        "_id": "university$uva",
        "name": "The University of Virginia"
    },
    {
        "_id": "certificate$1",
        "certificate/university": "university$uva",
        "certificate/hash": "ef5fbe5e006b59cf6012358a9c4efccd2eb56cef135b18b50aa6f024add7842f",
        "certificate/date": 1527825600000
    },
    {
        "_id": "certificate$2",
        "certificate/university": "university$uva",
        "certificate/hash": "6d520059e2af7acb535c60822cb07b74073c07ef5369e41e8fb257595cbd9039",
        "certificate/date": 1527825600000
    },
    {
        "_id": "certificate$3",
        "certificate/university": "university$uva",
        "certificate/hash": "61f03532b6b1d95e0ff48932cb3fbd21e1f562937fcd920d21056c97a07b97db",
        "certificate/date": 1527825600000
    },
    {
        "_id": "certificate$4",
        "certificate/university": "university$uva",
        "certificate/hash": "844d3cdaa195d84c861dba55448efacfcf380d7a1428d79388daa7092184639b",
        "certificate/date": 1527825600000
    },
    {
        "_id": "user$1",
        "user/firstName": "John",
        "user/lastName": "Smith",
        "user/verificationStatus": "Unverified"
    },
    {
        "_id": "user$2",
        "user/firstName": "Jane",
        "user/lastName": "Doe",
        "user/verificationStatus": "Unverified"
    },
    {
        "_id": "user$3",
        "user/firstName": "Kalpana",
        "user/lastName": "Rao",
        "user/verificationStatus": "Unverified"
    },
    {
        "_id": "user$4",
        "user/firstName": "Yuto",
        "user/lastName": "Takashi",
        "user/verificationStatus": "Unverified"
    },
    {
        "_id": "verificationOrg$1",
        "name": "Fluree Recruitment",
        "applicants": ["user$1", "user$2", "user$3", "user$4"]
    }
]