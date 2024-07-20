import { Image, ImageProps } from "expo-image";

export const NetworkImage = (props: {
    uri: string;
    style?: ImageProps["style"];
}) => {
  return (
    <Image
      source={{uri: props.uri}}
      style={props.style}
      cachePolicy="disk"
    />
  );
}