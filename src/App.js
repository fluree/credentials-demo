import React from 'react';
import { SHA256 } from 'crypto-js';
import { generateKeyPair, getSinFromPublicKey, signTransaction } from 'fluree-cryptography'

import { flureeFetch } from './flureeFetch';
import schemaTxn from './01_schema'
import seedTxn from './02_seed'
import { badTxn1, badTxn2 } from './03_transactions'

import './App.css';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import TableFooter from '@material-ui/core/TableFooter';
import scss from './table-widget.module.scss';

function delay(t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t)
  });
}

const goodUser = (() => {
  const { publicKey, privateKey } = generateKeyPair()
  const authId = getSinFromPublicKey(publicKey)
  return ({
    privateKey,
    publicKey,
    authId
  })
})()

const badUser = (() => {
  const { publicKey, privateKey } = generateKeyPair()
  const authId = getSinFromPublicKey(publicKey)
  return ({
    privateKey,
    publicKey,
    authId
  })
})()

const userTxn = [
  {
    "_id": "_auth$1",
    "id": goodUser.authId,
    "roles": [["_role/id", "root"]]
  },
  {
    "_id": "_auth$2",
    "id": badUser.authId,
    "roles": [["_role/id", "root"]]
  },
  {
    "_id": "_user$goodUser",
    "username": "GoodFaithMcGee",
    "auth": ["_auth$1"]
  },
  {
    "_id": "_user$badUser",
    "username": "BadFaithBobby",
    "auth": ["_auth$2"]
  }
]

const bootstrapDatabase = () => {
  return flureeFetch('/new-db', { "db/id": "cred/test" })
    .then(res => delay(2500))
    .then(res => flureeFetch('/transact', schemaTxn))
    .then(res => flureeFetch('/transact', userTxn))
    .then(res => flureeFetch('/command', signTransaction(goodUser.authID, "cred/test", Date.now() + 1000, 100000, 1, goodUser.privateKey, JSON.stringify(seedTxn))))
    .then(res => flureeFetch('/command', signTransaction(badUser.authID, "cred/test", Date.now() + 1000, 100000, 1, badUser.privateKey, JSON.stringify(badTxn1))))
    .then(res => flureeFetch('/command', signTransaction(badUser.authID, "cred/test", Date.now() + 1000, 100000, 1, badUser.privateKey, JSON.stringify(badTxn2))))
}

class CertificateHistory {
  constructor(data = []) {
    this._id = Math.random()
    this.encryptedHash = data[2]
    this.username = data[6]
    this.blockNumber = data[7]
    this.date = new Date(data[8])
  }
}

class HashHistory {
  constructor(data = []) {
    this._id = Math.random()
    this.wasAdded = data[4]
    this.username = data[6]
    this.blockNumber = data[7]
    this.date = new Date(data[8])
  }
}

const tabs = [{
  title: 'Applicant Verification'
}, {
  title: 'Subject History'
}, {
  title: 'Object History'
}];

class App extends React.Component {
  state = {
    orgName: "",
    applicants: [],
    tabIndex: 0,
    certificateID: null,
    activeHash: null
  }

  componentDidMount() {
    const query = {
      "select": ["*", { "applicants": ["*"] }],
      "from": ["verificationOrg/name", "Fluree Recruitment"]
    }

    flureeFetch('/query', query)
      .then(res => {
        this.setState({ orgName: res["verificationOrg/name"], applicants: res.applicants })
      })
      .catch(err => {
        if (/not found/.test(err.message)) {
          bootstrapDatabase()
            .then(res => window.location.reload())
        }
      })
  }


  updateApplicants = (transaction, status) => {
    const _id = transaction[0]._id
    flureeFetch('/transact', transaction)
      .then(res => {
        const updatedApplicant = { ...this.state.applicants.find(a => a._id === _id), "user/verificationStatus": status }
        const otherApplicants = this.state.applicants.filter(a => a._id !== _id)
        this.setState(prevState => ({ ...prevState, applicants: [...otherApplicants, updatedApplicant] }))
      })
      .catch(err => console.log(err))
  }

  fetchHashHist = async (hash) => {
    this.setState({ activeHash: hash })

    const query = {
      history: [null, "certificate/hash", hash]
    }

    flureeFetch('/history', query)
      .then(res => {
        if (!res[0]) { return }
        let assertions = res
        let multiQuery = {}
        res.forEach((flake, i) => {
          multiQuery[i] = {
            "select": [
              "?userName", "?blockNo", "?blockInstant"
            ],
            "where": [
              [flake[3], "_tx/auth", "?txAuthId"],
              ["?user", "_user/auth", "?txAuthId"],
              ["?user", "_user/username", "?userName"],
              ["?block", "_block/transactions", flake[3]],
              ["?block", "_block/number", "?blockNo"],
              ["?block", "_block/instant", "?blockInstant"]
            ]
          }
        })
        flureeFetch('/multi-query', multiQuery)
          .then(res => {
            const data = []
            Object.values(res).forEach((authBlockArray, i) => {
              data.push(assertions[i].concat(authBlockArray[0]))
            })
            const hashData = data.map(flake => new HashHistory(flake))
            this.setState({ hashData })
          })
          .catch(err => {
            debugger
          })

      })
      .catch(err => console.log(err))
  }

  fetchCertHist = async (certId) => {
    this.setState({ certificateID: certId })
    const query = {
      history: [certId, "certificate/hash"]
    }

    return flureeFetch('/history', query)
      .then(res => {
        const assertions = res.filter(flake => flake[4])
        let multiQuery = {}
        assertions.forEach((flake, i) => {
          multiQuery[i] = {
            "select": [
              "?userName", "?blockNo", "?blockInstant"
            ],
            "where": [
              [flake[3], "_tx/auth", "?txAuthId"],
              ["?user", "_user/auth", "?txAuthId"],
              ["?user", "_user/username", "?userName"],
              ["?block", "_block/transactions", flake[3]],
              ["?block", "_block/number", "?blockNo"],
              ["?block", "_block/instant", "?blockInstant"]
            ]
          }
        })

        return flureeFetch('/multi-query', multiQuery)
          .then(res => {
            const data = []
            Object.values(res).forEach((authBlockArray, i) => {
              data.push(assertions[i].concat(authBlockArray[0]))
            })
            const certificateData = data.map(flake => new CertificateHistory(flake))
            this.setState({ certificateData })
          })
          .catch(err => {
            debugger
          })

      })
      .catch(err => console.log(err))
  }

  checkHash = (applicant) => {
    if (!applicant) {
      return
    }
    const { hash, _id } = applicant
    const query = {
      "select": ["*", { "certificate/university": ["name"] }],
      "from": ["certificate/hash", hash]
    }
    let transaction = [{
      _id: _id
    }]

    flureeFetch("/query", query)
      .then(res => {
        if (res === null) {
          this.fetchHashHist(hash)
          transaction[0]["verificationStatus"] = "Rejected"
          this.updateApplicants(transaction, "Rejected")
          window.alert("This certificate is invalid!")
        } else {
          this.fetchCertHist(res._id)
          .then(res => this.fetchHashHist(hash))
          transaction[0]["verificationStatus"] = "Verified"
          this.updateApplicants(transaction, "Verified")
          const dateTransacted = new Date(res['certificate/date']).toLocaleDateString()
          const issuedBy = res['certificate/university'].name
          window.alert(`This is a valid certificate! It was issued by ${issuedBy} on ${dateTransacted}`)
        }
      })
      .catch(err => console.log(err))
  }

  render() {
    let table
    switch (this.state.tabIndex) {
      case 1:
        table = <TranscriptTable activeCert={this.state.certificateID} certificateData={this.state.certificateData} applicants={[]} checkHash={this.checkHash} changeTab={(tabIndex) => this.setState({ tabIndex })} />
        break;
      case 2:
        table = <HashTable activeHash={this.state.activeHash} hashData={this.state.hashData} applicants={[]} checkHash={this.checkHash} changeTab={(tabIndex) => this.setState({ tabIndex })} />
        break
      default:
        table = <ApplicantTable applicants={this.state.applicants} checkHash={this.checkHash} changeTab={(tabIndex) => this.setState({ tabIndex })} />
    }
    return (
      <div className="App">
        <header className="App-header">
          <Grid container justify="center" spacing={10}>

            <Grid key={1} item xs={12} sm={12} md={8} style={styles.grid}>
              <Typography variant="h4" style={styles.typography}>
                {this.state.orgName}
              </Typography>
              <Paper style={styles.paper}>
                {table}
              </Paper>
            </Grid>

          </Grid>
        </header>
      </div>
    );
  }
}

class ApplicantTable extends React.Component {
  state = {
    activeTabIndex: 0,
    page: 0,
    rowsPerPage: 5,
    data: this.props.applicants
  };


  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  changeTab = (event, tabIndex) => {
    this.props.changeTab(tabIndex)
  }

  handleSubmit = async () => {
    await this.props.checkHash(this.state.updatedApplicant)
    this.setState({ updatedApplicant: null })
  }

  onChange = async (event, _id) => {
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = (event) => {
      var data = event.target.result;
      var encrypted = SHA256(data).toString();
      console.log(encrypted)
      const updatedApplicant = { ...this.props.applicants.find(a => a._id === _id), hash: encrypted }
      const otherApplicants = this.props.applicants.filter(a => a._id !== _id)
      this.setState(prevState => ({ ...prevState, applicants: [...otherApplicants, updatedApplicant], updatedApplicant }))
    };

    reader.readAsBinaryString(file);
  }

  render() {
    const { rowsPerPage, page, updatedApplicant } = this.state;
    const { applicants } = this.props
    const data = applicants && applicants.sort((a, b) => {
      if (a["user/lastName"] > b["user/lastName"]) {
        return 1
      }
      if (a["user/lastName"] < b["user/lastName"]) {
        return -1
      }
      return 0
    })
    return (
      <div className={scss['portal-chart-tabs']}>
        <Tabs
          className={scss['portal-chart-tabs-container']}
          indicatorColor="primary"
          textColor="primary"
          value={this.state.activeTabIndex}
          onChange={this.changeTab}
        >
          {tabs.map(tab => (
            <Tab
              classes={{
                root: scss['portal-chart-tabs-root'],
                wrapper: scss['portal-chart-tabs-wrapper']
              }}
              label={<Typography variant="caption" gutterBottom>{tab.title}</Typography>}
              key={tab.title}
            />
          ))}
        </Tabs>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Last Name</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Verify Transcript</TableCell>
              <TableCell>Verification Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage).map(n => {
              const isActive = updatedApplicant && n._id === updatedApplicant._id
              const verificationStatus = n["user/verificationStatus"]
              let color = '#000'
              if (verificationStatus === "Verified") { color = 'green' }
              if (verificationStatus === "Rejected") { color = 'red' }
              return (
                <TableRow key={n._id}>
                  <TableCell>{n["user/lastName"]}</TableCell>
                  <TableCell>{n["user/firstName"]}</TableCell>
                  <TableCell>{isActive ? <button onClick={this.handleSubmit}>Verify</button> : <input id="upload" type="file" onChange={(e) => this.onChange(e, n._id)} />}</TableCell>
                  <TableCell><span style={{ color }}>{n["user/verificationStatus"]}</span></TableCell>
                </TableRow>)
            }
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                colSpan={4}
                count={this.props.applicants.length}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5]}
                page={page}
                backIconButtonProps={{
                  'aria-label': 'Previous Page'
                }}
                nextIconButtonProps={{
                  'aria-label': 'Next Page'
                }}
                onChangePage={this.handleChangePage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    );
  }
}

class TranscriptTable extends React.Component {
  state = {
    activeTabIndex: 1,
    page: 0,
    rowsPerPage: 5,
    data: []
  };


  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  changeTab = (event, tabIndex) => {
    this.props.changeTab(tabIndex)
  }

  render() {
    const { rowsPerPage, page } = this.state;
    let data = this.props.certificateData || []
    if (data[0]) {
      data = data.sort((a, b) => a.blockNumber - b.blockNumber)
    } else if (this.props.activeHash) {
      setTimeout(() => window.alert("The last document uploaded has never been associated with a transcript in the blockchain."), 200)
    } else {
      setTimeout(() => window.alert("Please upload a transcript for verification."), 200)
    }
    return (
      <div className={scss['portal-chart-tabs']}>
        <Tabs
          className={scss['portal-chart-tabs-container']}
          indicatorColor="primary"
          textColor="primary"
          value={this.state.activeTabIndex}
          onChange={this.changeTab}
        >
          {tabs.map(tab => (
            <Tab
              classes={{
                root: scss['portal-chart-tabs-root'],
                wrapper: scss['portal-chart-tabs-wrapper']
              }}
              label={<Typography variant="caption" gutterBottom>{tab.title}</Typography>}
              key={tab.title}
            />
          ))}
        </Tabs>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Block #</TableCell>
              <TableCell>Uploaded Hash</TableCell>
              <TableCell>Transaction Issued By</TableCell>
              <TableCell>Date of Transaction</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage).map(n => {
              return (
                <TableRow key={n._id}>
                  <TableCell>{n.blockNumber}</TableCell>
                  <TableCell>{n.encryptedHash}</TableCell>
                  <TableCell>Auth Record: {n.username}</TableCell>
                  <TableCell>{n.date.toLocaleDateString()}</TableCell>
                </TableRow>)
            }
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                colSpan={4}
                count={data.length}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5]}
                page={page}
                backIconButtonProps={{
                  'aria-label': 'Previous Page'
                }}
                nextIconButtonProps={{
                  'aria-label': 'Next Page'
                }}
                onChangePage={this.handleChangePage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    );
  }
}

class HashTable extends React.Component {
  state = {
    activeTabIndex: 2,
    page: 0,
    rowsPerPage: 5,
    data: []
  };


  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  changeTab = (event, tabIndex) => {
    this.props.changeTab(tabIndex)
  }

  render() {
    const { rowsPerPage, page } = this.state;
    let data = this.props.hashData || []
    if (data[0]) {
      data = data.sort((a, b) => a.blockNumber - b.blockNumber)
    } else if (this.props.activeHash) {
      setTimeout(() => window.alert("The last document uploaded did not match any certificate active in the database."), 200)
    } else {
      setTimeout(() => window.alert("Please upload a transcript for verification."), 200)
    }
    return (
      <div className={scss['portal-chart-tabs']}>
        <Tabs
          className={scss['portal-chart-tabs-container']}
          indicatorColor="primary"
          textColor="primary"
          value={this.state.activeTabIndex}
          onChange={this.changeTab}
        >
          {tabs.map(tab => (
            <Tab
              classes={{
                root: scss['portal-chart-tabs-root'],
                wrapper: scss['portal-chart-tabs-wrapper']
              }}
              label={<Typography variant="caption" gutterBottom>{tab.title}</Typography>}
              key={tab.title}
            />
          ))}
        </Tabs>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Block #</TableCell>
              <TableCell>Added / Deleted</TableCell>
              <TableCell>Transaction Issued By</TableCell>
              <TableCell>Date of Transaction</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, (page * rowsPerPage) + rowsPerPage).map(n => {
              return (
                <TableRow key={n._id}>
                  <TableCell>{n.blockNumber}</TableCell>
                  <TableCell>{n.wasAdded ? <span style={{ color: 'green' }}>Added</span> : <span style={{ color: 'red' }}>Deleted</span>}</TableCell>
                  <TableCell>Auth Record: {n.username}</TableCell>
                  <TableCell>{n.date.toLocaleDateString()}</TableCell>
                </TableRow>)
            }
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                colSpan={4}
                count={data.length}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5]}
                page={page}
                backIconButtonProps={{
                  'aria-label': 'Previous Page'
                }}
                nextIconButtonProps={{
                  'aria-label': 'Next Page'
                }}
                onChangePage={this.handleChangePage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    );
  }
}

const styles = {
  grid: {
    flex: '1 1 100%',
    display: 'flex',
    flexDirection: 'column'
  },
  paper: {
    flex: '1 1 100%'
  },
  typography: {
    textTransform: 'uppercase',
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftStyle: 'solid',
    marginTop: 16,
    marginBottom: 16,
    '&:after': {
      content: '""',
      width: 2,
      height: '0%',
      position: 'absolute',
      bottom: 0,
      left: -2,
      transition: 'height .5s'
    }
  }
}

export default App;
