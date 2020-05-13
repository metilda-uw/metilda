import {
    faCircle,
    faCut,
    faEllipsisH,
    faRulerHorizontal,
    faSearchMinus,
    faSearchPlus
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as React from "react";
import PieMenu, {Slice} from "react-pie-menu";
import {css, ThemeProvider} from "styled-components";
import * as peldaAudioImgMenuStyles from "./PeldaAudioImgMenu.styles";

export interface PeldaAudioAnalysisImageMenuProps {
    onClick: () => void;
    imgMenuX: number;
    imgMenuY: number;
    isSelectionActive: boolean;
    isAllShown: boolean;
    intervalSelected: () => void;
    showZoomOutAudio: () => void;
}

export default class PeldaAudioAnalysisImageMenu extends React.Component<PeldaAudioAnalysisImageMenuProps> {
    render() {
        const theme = {
            pieMenu: {
                container: css`z-index: 10;`,
            },
            slice: {
                container: peldaAudioImgMenuStyles.container,
            }
        };

        const maybeDo = (disabled: boolean, action: () => void) => {
            if (!disabled) {
                action();
            }
        };

        return (
            <div className="PeldaAudioAnalysisImageMenu"
                 onContextMenu={(e) => e.preventDefault()}
                 onClick={this.props.onClick}>
                <ThemeProvider theme={theme}>
                    <PieMenu
                        radius="110px"
                        centerRadius="20px"
                        centerX={`${this.props.imgMenuX}px`}
                        centerY={`${this.props.imgMenuY}px`}
                    >
                        <Slice onSelect={() => maybeDo(!this.props.isSelectionActive, this.props.intervalSelected)}
                               disabled={!this.props.isSelectionActive}
                               backgroundColor="darkgrey"
                               className="AudioAnalysisImageMenu-option-zoom">
                            <div className="menu-icon-top-all">
                                <FontAwesomeIcon icon={faSearchPlus}
                                                 size="2x"/>
                                <br/>
                                <span className="AudioAnalysisImageMenu-label">Zoom In</span>
                            </div>
                        </Slice>
                        <Slice backgroundColor="lightgrey"
                               className="AudioAnalysisImageMenu-option-blank">
                            <div className="menu-icon-left-all">
                            </div>
                        </Slice>
                        <Slice onSelect={() => maybeDo(this.props.isAllShown, this.props.showZoomOutAudio)}
                               disabled={this.props.isAllShown}
                               backgroundColor="darkgrey"
                               className="AudioAnalysisImageMenu-option-showall">
                            <div className="menu-icon-bottom-all">
                                <FontAwesomeIcon icon={faSearchMinus}
                                                 size="2x"/>
                                <br/>
                                <span className="AudioAnalysisImageMenu-label">Zoom Out</span>
                            </div>
                        </Slice>
                        <Slice backgroundColor="lightgrey"
                               className="AudioAnalysisImageMenu-option-blank">
                            <div className="menu-icon-right-all">
                            </div>
                        </Slice>
                    </PieMenu>
                </ThemeProvider>
            </div>
        );
    }
}
