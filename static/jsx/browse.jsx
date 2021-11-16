
class App extends React.Component{
    constructor(props) {
        super(props);

        this.state = {"pubKey": "",
            "loggedIn": false,
            "logoutButton": false,
            "loginForm": false,
            "availableUsers": [],
            "metadata": {},
            "users": [],
            "selectedMetadata": "",
            "selectedURI": "",
            "mintVerification": []
        }
    }

    componentDidMount(){
        var that = this
        this.getUsersItems()
        $.ajax({
            url: "/user/data",
            success: (result) => {
                if (result != "false"){
                    that.setState({"pubKey": result, "loggedIn": true})
                }
            }
        })
    }

    userloginpost = () => {
        $.ajax({
            url: "/login",
            method: "post",
            data: {
                "username": $("#username-input").val(),
                "password": $("#password-input").val()
            },
            success: (result) => {
                if (result.status == "success"){
                    window.location.reload()
                }
            }
        })
    }

    userLoginToggle = () => {
            var newState = this.state.loginForm
            if (newState == false){
                newState = true
            } else{
                newState = false
            }
            this.setState({"loginForm": newState})
    }

    userLoginForm = () => {

        if (this.state.loginForm == true){
            return(
                <div className={"user-login_box"}>
                    <input type={"text"} id={"username-input"} placeholder={"Username"} /> <br />
                    <input type={"password"} id={"password-input"} placeholder={"Password"}/> <br/>
                    <button onClick={() => {this.userloginpost()}}>Login</button>
                </div>
            )
        }

    }

    userLogoutToggle = () => {

        this.setState({"logoutButton": !this.state.logoutButton})
    }

    logout = () => {
        window.location.href = "/logout"
    }

    userLogoutForm = () => {

        if (this.state.logoutButton == true){
            return(
                <button className={"logout"} onClick={() => this.logout()}>Logout</button>
            )
        }

    }

    goHome = () => {
        window.location.href ="/"
    }

    header = () => {
        if (this.state.loggedIn){
            return(
                <div  id="header">
                     <div onClick={() => this.goHome()} id={"header-left"}>
                         <div className={"logo"}>
                            <img src={"/static/images/logo.png"} />
                        </div>

                    </div>

                     <div id={"header-right"}>
                              <div onClick={() => this.userLogoutToggle()} className={"login-button"}>
                                <p>Logged In</p>

                              </div>
                                {this.userLogoutForm()}


                     </div>

                </div>
            )
        } else{
            return(
                 <div id="header">
                     <div id={"header-left"}>
                         <div onClick={() => this.goHome()} className={"logo"}>
                            <img src={"/static/images/logo.png"} />
                        </div>


                    </div>
                     <div id={"header-right"}>

                        <div onClick={() => this.userLoginToggle()} className={"login-button"}>
                            <p>Login</p>
                        </div>
                         {this.userLoginForm()}

                     </div>
                 </div>
            )
        }
    }

    getUsersItems = async () => {
        var that = this
        $.ajax({
            url: "/browse/selections",
            success: (result) => {
                that.setState({"availableUsers": result.usermints, "mintVerification": result.verification})
            }
        })
    }

    nftCaseItem = (nft) => {
        var that = this
        let metadatauri = nft[Object.keys(nft)[0]]
        if (!Object.keys(this.state.metadata).includes(metadatauri)){
            that.state.metadata[metadatauri] = "'"
             $.ajax({
            url: metadatauri,
            success: (metadata) => {
                let currentMetadata = that.state.metadata
                currentMetadata[metadatauri] = metadata
                that.setState({"metadata": currentMetadata})
            }
        })
        }
    }

    toUserPage = (user) => {
        window.location.href = "/user/"+user
    }

    openmetadata = (metamint, metauri) => {
        this.setState({"selectedMetadata": metamint, "selectedURI": metauri})
    }

    renderMetadata = () => {


        var close = () => {
             this.setState({"selectedMetadata": "", "selectedURI": ""})
        }

        if (this.state.selectedMetadata.length > 0){

            var verified = ""
            var verifiedB = ""
            var tempMeta = this.state.mintVerification[this.state.selectedMetadata]
            verified = tempMeta[0]
            verifiedB= tempMeta[1]
            var metadata = this.state.metadata[this.state.selectedURI]

            return(
                <div className={"nft-metadata-case"}>
                    <button onClick={() => close()}>Close</button>
                    <h2>{metadata.name}</h2>
                    <h3>{verified} {verifiedB}</h3>
                    <p>{metadata.description}</p>
                    <img src={metadata.image} />
                        <h3>Attributes</h3>

                    <table>
                        <tbody>
                        {metadata.attributes.map((attribute, idx) => (
                            <tr>
                                <td>{attribute.trait_type}</td>
                                <td>{attribute.value}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )
        }

    }

    verifiedStatusText = (mint) => {
        return(<p>{this.state.mintVerification[mint][0]}</p>)
    }

    browseMenu = () => {
        return(
            <div>
                <h2>Available Items</h2>
                {this.state.availableUsers.map((item, idx) => (
                    <div key={idx} className={"user-row"}>
                    <div onClick={() => this.toUserPage(Object.keys(item)[0])} style={{"marginBottom": "20px","cursor": "pointer","width": "fit-content", "marginLeft": "auto", "marginRight": "auto", "border": "solid 1px white", "padding": "5px 20px", "borderRadius": "5px"}}>

                        <h3 >{Object.keys(item)[0]}'s NFTs</h3>
                    </div>
                        <div className={"nft-display"}>
                             {this.state.availableUsers[0][Object.keys(this.state.availableUsers[0])].map((nft, idnx) => {
                                 this.nftCaseItem(nft)
                                 return(
                                     <div onClick={() => this.openmetadata(Object.keys(nft)[0], nft[Object.keys(nft)[0]])} className={"nft-case"} key={idnx}>
                                         {this.verifiedStatusText(Object.keys(nft)[0])}
                                         <p>{this.state.metadata[nft[Object.keys(nft)[0]]].name}</p>
                                         <img src={this.state.metadata[nft[Object.keys(nft)[0]]].image} />
                                     </div>
                                     )
                                 }
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    getUsers = () => {
        var that = this
        this.setState({"users": []})
        $.ajax({
            url: "/search/users",
            data: {
                "query": $("#user-search-query").val()
            },
            success: (result) => {
                that.setState({"users": result})
            }
        })
    }

    goToUser = (user) => {
        window.location.href = "/user/" +user
    }

    searchUsers = () => {
        return(
            <div style={{"width": "fit-content", "marginLeft": "auto", "marginRight": "auto"}}>
                <h3>Search For Users</h3>
                <div className={"user-search"}>
                    <input type={"text"} placeholder={"Search"} id={"user-search-query"} />
                    <button onClick={() => this.getUsers()}>Search</button>
                </div>
                <div>
                    {this.state.users.map((user) => (
                        <div className={"link-button"} onClick={() => this.goToUser(user)}>{user}</div>
                    ))}
                </div>
            </div>
        )
    }


    render(){

        return(
            <div>
                {this.header()}
                {this.searchUsers()}
                {this.browseMenu()}
                {this.renderMetadata()}
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById("body"))