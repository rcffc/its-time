import React, { Component } from "react";
import { Collapse, Timeline } from "antd";
import "./Dashboard.css";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = { data: null };
  }

  fireRequest() {
    const api =
      "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql";

    const request = `
      {
        plan(
          from: {lat: 60.168992, lon: 24.932366}
          to: {lat: 60.169403, lon: 24.925805}
          numItineraries: 6
        ) {
          itineraries {
            legs {
              startTime
              endTime
              mode
              duration
              realTime
              distance
              transitLeg
            }
          }
        }
      }
    `;

    const reqParams = {
      headers: {
        "content-type": "application/graphql; charset=UTF-8"
      },
      body: request,
      method: "POST"
    };

    fetch(api, reqParams)
      .then(data => {
        return data.json();
      })
      .then(res => {
        this.state.data = res;
        console.log(res);
      })
      .catch(error => console.log(error));
  }

  componentDidMount() {
    setInterval(() => {
      this.fireRequest();
    }, 60000);
  }

  render() {
    return <div className="HelloWorld">{this.state.data}</div>;
  }
}

export default Dashboard;
