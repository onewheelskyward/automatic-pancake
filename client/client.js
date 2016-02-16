// client.js
var React = require('react');
var ReactDOM = require('react-dom');
var Dropzone = require('react-dropzone');
var request = require('superagent');
var baseUri = 'http://localhost:3456';

ReactDOM.render(
    <h1>Pancake All The Things</h1>,
    document.getElementById('header')
);

var DropzoneDemo = React.createClass({
    onDrop: function (files) {
        var req = request.post(baseUri + '/upload');
        files.forEach((file)=> {
            req.attach(file.name, file);
            this.setState({filename: file.name});
        });
        req.end(); // 'callback' goes here.
    },

    render: function () {
        return (
            <div>
                <Dropzone onDrop={this.onDrop}>
                    <div>Enter the dropzone, or click to select.</div>
                </Dropzone>
            </div>
        );
    }
});

ReactDOM.render(<DropzoneDemo />, document.getElementById('dropzone'));

var YoutubeForm = React.createClass({
    getInitialState: function () {
        return {uri: ''};
    },
    handleUriChange: function (e) {
        this.setState({uri: e.target.value});
    },
    handleSubmit: function (e) {
        e.preventDefault();
        console.log(e.target.value);
        var uri = this.state.uri.trim();
        if (!uri) {
            return;
        }
        // TODO: send request to the server
        req = request.post('http://localhost:3456/youtube')
            .send({uri: uri})
            .end(function (err, res) {
            }.bind(this));

        console.log(uri);
        this.setState({uri: ''});
    },
    render: function () {
        return (
            <form className="youtubeForm" onSubmit={this.handleSubmit}>
                <input type="text"
                       placeholder="youtube url or ID"
                       value={this.state.uri}
                       onChange={this.handleUriChange}
                />
                <input type="submit" value="Post"/>
            </form>
        );
    }
});

var VolumeForm = React.createClass({
    getInitialState: function () {
        return {volume: ''};
    },
    handleUriChange: function (e) {
        this.setState({volume: e.target.value});
    },
    handleSubmit: function (e) {
        e.preventDefault();
        console.log(e.target.value);
        var volume = this.state.volume.trim();
        if (!volume) {
            return;
        }
        req = request.post('http://localhost:3456/vol/' + volume)
            .end(function (err, res) {
            }.bind(this));

        console.log(volume);
        //this.setState({volume: volume});
    },
    render: function () {
        return (
            <form className="volumeForm" onSubmit={this.handleSubmit}>
                <input type="text"
                       placeholder="80"
                       value={this.state.volume}
                       onChange={this.handleUriChange}
                />
                <input type="submit" value="Post"/>
            </form>
        );
    }
});

var SoundBox = React.createClass({
    getInitialState: function () {
        return {data: []};
    },
    componentDidMount: function () {
        this.getFiles();
        setInterval(this.getFiles, this.props.pollInterval);
    },
    getFiles: function () {
        req = request.get(this.props.url)
            .end(function (err, res) {
                this.setState({data: res.body})
            }.bind(this));
    },
    render: function () {
        return (
            <div className="soundBox">
                <YoutubeForm />
                <VolumeForm />
                <SoundList data={this.state.data}/>
            </div>
        );
    }
});

var SoundList = React.createClass({
    propTypes: {
        data: React.PropTypes.array.isRequired
    },
    render: function () {
        var soundNodes = this.props.data.map(function (sound) {
            return (
                <Sound filename={sound.file} id={sound.id} key={sound.id}>
                    {sound.created}
                </Sound>
            );
        });
        return (
            <div className="soundList">
                {soundNodes}
            </div>
        );
    }
});

var Sound = React.createClass({
    render: function () {
        return (
            <div onClick={this.handleClick} className="sound">
                {this.props.filename}
            </div>
        );
    },
    handleClick: function (event) {
        var req = request.post(baseUri + '/play/' + this.props.id);
        req.end(); // 'callback' goes here.
    }
});

ReactDOM.render(
    <SoundBox url="http://localhost:3456/files" pollInterval={5000}/>,
    document.getElementById('sounds')
);

var Kill = React.createClass({
    render: function () {
        return (
            <div onClick={this.handleClick} className="kill">
                Kill
            </div>
        );
    },
    handleClick: function (event) {
        var req = request.post(baseUri + '/kill')
            .send();
        req.end(); // 'callback' goes here.
    }
});

ReactDOM.render(
    <Kill/>,
    document.getElementById('kill')
);


