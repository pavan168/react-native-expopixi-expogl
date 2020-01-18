import React, { Component } from "react";
import { PIXI } from "expo-pixi";
import { GLView } from "expo-gl";
import { Dimensions, SafeAreaView, PixelRatio, Alert } from "react-native";
import ImageZoom from "react-native-image-pan-zoom";

const window = Dimensions.get("window");
const mapImageUrl = "https://i.pinimg.com/originals/75/5e/96/755e96ea79c7821950c4f64831a3b1db.jpg";

interface State {
  markers: any;
  app: any;
}

export default class App extends Component<{}, State> {
  constructor(props) {
    super(props);
    this.state = {
      markers: [
        {
          id: 0,
          x: 535,
          y: 270,
          name: "Alert 1",
          description: "Description"
        },
        {
          id: 1,
          x: 535,
          y: 600,
          name: "Alert 2",
          description: "Description"
        }
      ],
      app: null
    };
  }

  private renderMarkers = async (app, ratio) => {
    this.state.markers.map(async marker => {
      const fire = await PIXI.Sprite.fromExpoAsync(
        require("./assets/fire-extinguisher.png")
      );
      fire.name = marker.id;
      fire.width = 10;
      fire.height = 10;
      fire.position.set(marker.x, marker.y);
      // fire.scale.set(ratio, ratio);
      fire.scale.set(0.1, 0.1);

      app.stage.addChild(fire);
    });
  };

  _onContextCreate = async context => {
    const app = new PIXI.Application({ context });
    app.renderer.backgroundColor = 0x061639;
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoResize = true;
    // app.renderer.resize(window.width, window.height);

    var ratio = Math.min(
      window.width / app.renderer.width,
      window.height / app.renderer.height
    );

    // initialize the map
    const map = await PIXI.Sprite.fromExpoAsync(mapImageUrl);
    map.name = "map";
    map.position.set(0, 0);
    map.scale.set(ratio, ratio);

    app.stage.addChild(map);

    this.renderMarkers(app, ratio);
    this.setState({ app });
  };

  onPressMarker = event => {
    const scale = PixelRatio.get();

    this.state.app.stage.children.map(marker => {
      if (
        marker
          .getBounds()
          .contains(event.locationX * scale, event.locationY * scale)
      ) {
        marker.name !== "map" && this.showAlert(marker);
      }
    });
  };

  showAlert = marker => {
    let item = this.state.markers.filter(item => item.id == marker.name)[0];
    Alert.alert(
      `${item.name}`,
      `${item.description}`,
      [{ text: "OK", onPress: () => null }],
      { cancelable: false }
    );
  };

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ImageZoom
          cropWidth={Dimensions.get("window").width}
          cropHeight={Dimensions.get("window").height}
          imageWidth={window.width}
          imageHeight={window.height}
          pinchToZoom={true}
          onClick={this.onPressMarker.bind(this)}
        >
          <GLView
            style={{ flexGrow: 1, flexShrink: 0, flexBasis: "auto" }}
            onContextCreate={this._onContextCreate}
          />
        </ImageZoom>
      </SafeAreaView>
    );
  }
}
