"use client";

import React from "react";

export default class PreviewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMessage: ""
    };
  }

  static getDerivedStateFromError(error) {
    return {
      errorMessage: error?.message || "Unknown preview error."
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.errorMessage) {
      this.setState({
        errorMessage: ""
      });
    }
  }

  render() {
    if (this.state.errorMessage) {
      return (
        <div className="component-lab-preview-error">
          <h3>Preview failed</h3>
          <p>{this.state.errorMessage}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
