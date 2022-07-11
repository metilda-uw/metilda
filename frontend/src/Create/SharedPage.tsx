import * as React from "react";
import CreatePitchArt, {CreatePitchArtProps} from "./CreatePitchArt";
import {cssNumber} from "jquery";
import { PropsWithChildren } from "react";
import * as DEFAULT from "../constants/create";
interface Props {
     pageId: number;
     isBeingShared: false;
     isSharedPage: false;
     CreatePitchArtProps: any;
}

export default class SharedPage extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return( <CreatePitchArt
                    isBeingShared = {this.props.isBeingShared}
                    {...this.props.CreatePitchArtProps}
                />
        );
    }
}
