// client.js
var React = require('react');
var ReactDOM = require('react-dom');
var request = require('superagent');
var baseUri = 'http://localhost:3456';

ReactDOM.render(
    <h1>Edit Pancake All The Things</h1>,
    document.getElementById('header')
);

var SoundBox = React.createClass({
    getInitialState: function () {
        return {data: []};
    },
    componentDidMount: function () {
        this.getFiles();
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
                <SoundEditList data={this.state.data}/>
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
            <textarea onChange={this.handleChange} className="sound" value={this.props}>
            </textarea>
        );
    },
    handleChange: function (event) {
        var req = request.post(baseUri + '/play/' + this.props.id);
        req.end(); // 'callback' goes here.
    }
});

ReactDOM.render(
    <SoundBox url="http://localhost:3456/files" pollInterval={5000}/>,
    document.getElementById('sounds')
);
