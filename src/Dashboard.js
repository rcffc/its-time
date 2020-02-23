import React, { Component } from "react";
import { Collapse, Timeline } from "antd";
import "antd/dist/antd.css";
import "./Dashboard.css";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  fireRequest() {
    const api =
      "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql";

    const request = `
      {
        plan(
          from: {lat: 60.234504, lon: 25.012588}
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
        this.setState({ response: res });
        // console.log(res);
      })
      .catch(error => console.log(error));
  }

  componentDidMount() {
    this.fireRequest();
    setInterval(() => {
      this.fireRequest();
    }, 60000);
  }

  getDisplayTime(timestamp) {
    let date = new Date(timestamp);
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let formattedTime = hours + ":" + minutes.substr(-2);
    return formattedTime;
  }

  getDisplayDistance(distance) {
    return Math.ceil(distance / 100) / 10;
  }

  getDisplayDuration(duration) {
    return Math.ceil(duration / 60);
  }

  getTripDuration(trip) {
    return this.getDisplayDuration(
      trip.legs.map(leg => leg.duration).reduce((a, b) => a + b)
    );
  }

  render() {
    const { Panel } = Collapse;

    function callback(key) {}

    let collapse;
    if (this.state.response) {
      collapse = (
        <div>
          {this.state.response.data.plan.itineraries.map((it, it_index) => (
            <Collapse defaultActiveKey={[it_index]} onChange={callback}>
              <Panel
                header={
                  this.getDisplayTime(it.legs[0].startTime) +
                  " " +
                  this.getTripDuration(it) +
                  "m"
                }
                key={it_index}
              >
                <Timeline>
                  {it.legs.map((l, leg_index) => (
                    <Timeline.Item>
                      {leg_index}
                      Start Time: {this.getDisplayTime(l.startTime)}
                      Distance: {this.getDisplayDistance(l.distance)}
                      Mode: {l.mode}
                      Duration: {this.getDisplayDuration(l.duration)}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Panel>
            </Collapse>
          ))}
        </div>
      );
    } else {
      collapse = <div>else</div>;
    }
    return <div>{collapse}</div>;
  }
}

export default Dashboard;
