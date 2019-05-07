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
import * as audioImgMenuStyles from "./AudioImgMenu.styles";

export interface AudioAnalysisImageMenuProps {
    onClick: () => void;
    imgMenuX: number;
    imgMenuY: number;
    isSelectionActive: boolean;
    isAllShown: boolean;
    splitWord: () => void;
    intervalSelected: () => void;
    newManualPitch: () => void;
    newAvgPitch: () => void;
    newRangePitch: () => void;
    showAllAudio: () => void;
}

export default class AudioAnalysisImageMenu extends React.Component<AudioAnalysisImageMenuProps> {
    render() {
        const theme = {
            pieMenu: {
                container: css`z-index: 10;`,
            },
            slice: {
                container: audioImgMenuStyles.container,
            }
        };

        const maybeDo = (disabled: boolean, action: () => void) => {
            if (!disabled) {
                action();
            }
        };

        return (
            <div className="AudioAnalysisImageMenu"
                 onContextMenu={(e) => e.preventDefault()}
                 onClick={this.props.onClick}>
                <ThemeProvider theme={theme}>
                    <PieMenu
                        radius="110px"
                        centerRadius="20px"
                        centerX={`${this.props.imgMenuX}px`}
                        centerY={`${this.props.imgMenuY}px`}
                    >
                        <Slice onSelect={() => maybeDo(!this.props.isSelectionActive, this.props.splitWord)}
                               disabled={!this.props.isSelectionActive}
                               backgroundColor="darkgrey"
                               className="AudioAnalysisImageMenu-option-split">
                            <div className="menu-icon-top">
                                <FontAwesomeIcon icon={faCut} size="2x"/>
                                <br/>
                                <span className="AudioAnalysisImageMenu-label">Split</span>
                            </div>
                        </Slice>
                        <Slice onSelect={() => maybeDo(!this.props.isSelectionActive, this.props.intervalSelected)}
                               disabled={!this.props.isSelectionActive}
                               backgroundColor="lightgrey"
                               className="AudioAnalysisImageMenu-option-zoom">
                            <div className="menu-icon-top-right">
                                <FontAwesomeIcon icon={faSearchPlus}
                                                 size="2x"/>
                                <br/>
                                <span className="AudioAnalysisImageMenu-label">Zoom</span>
                            </div>
                        </Slice>
                        <Slice onSelect={() => maybeDo(!this.props.isSelectionActive, this.props.newManualPitch)}
                               disabled={!this.props.isSelectionActive}
                               backgroundColor="darkgrey"
                               className="AudioAnalysisImageMenu-option-manual">
                            <div className="menu-icon-bottom-right">
                                <FontAwesomeIcon icon={faCircle}
                                                 size="xs"
                                />
                                <br/>
                                <span className="AudioAnalysisImageMenu-label">Manual</span>
                            </div>
                        </Slice>
                        <Slice onSelect={() => maybeDo(!this.props.isSelectionActive, this.props.newAvgPitch)}
                               disabled={!this.props.isSelectionActive}
                               backgroundColor="lightgrey"
                               className="AudioAnalysisImageMenu-option-average">
                            <div className="menu-icon-bottom">
                                <FontAwesomeIcon icon={faEllipsisH}
                                                 size="2x"
                                                 className="avg-ellipsis"
                                />
                                <br/>
                                <FontAwesomeIcon icon={faRulerHorizontal}
                                                 size="2x"
                                />
                                <br/>
                                <span className="AudioAnalysisImageMenu-label">Average</span>
                            </div>
                        </Slice>
                        <Slice onSelect={() => maybeDo(!this.props.isSelectionActive, this.props.newRangePitch)}
                               disabled={!this.props.isSelectionActive}
                               backgroundColor="darkgrey"
                               className="AudioAnalysisImageMenu-option-range">
                            <div className="menu-icon-bottom-left">
                                <FontAwesomeIcon icon={faEllipsisH}
                                                 size="2x"/>
                                <br/>
                                <span className="AudioAnalysisImageMenu-label">Range</span>
                            </div>
                        </Slice>
                        <Slice onSelect={() => maybeDo(this.props.isAllShown, this.props.showAllAudio)}
                               disabled={this.props.isAllShown}
                               backgroundColor="lightgrey"
                               className="AudioAnalysisImageMenu-option-showall">
                            <div className="menu-icon-top-left">
                                <FontAwesomeIcon icon={faSearchMinus}
                                                 size="2x"/>
                                <br/>
                                <span className="AudioAnalysisImageMenu-label">All</span>
                            </div>
                        </Slice>
                    </PieMenu>
                </ThemeProvider>
            </div>
        );
    }
}
