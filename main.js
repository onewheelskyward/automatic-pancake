// main.js
var React = require('react');
var ReactDOM = require('react-dom');

ReactDOM.render(
<h1>Hello, world!</h1>,
    document.getElementById('example')
);

var DropzoneDemo = React.createClass({
    onDrop: function (files) {
        console.log('Received files: ', files);
    },

    render: function () {
        return (
            <div>
                <Dropzone onDrop={this.onDrop}>
                    <div>Try dropping some files here, or click to select files to upload.</div>
                </Dropzone>
            </div>
        );
    }
});

React.render(<DropzoneDemo />, document.body);
