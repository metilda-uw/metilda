import React from "react";

interface Props {
    x: number;
    y: number;
    showAccentPitch: boolean;
    onAddSecondaryAccent: () => void;
    onRemoveSecondaryAccent: () => void;
    onClose: () => void;
    isMerged: boolean;
    onMergeIndex: () => void;
    onUnmergeIndex: () => void;
    onHideThisSpeaker?: () => void;
    onShowAllSpeakers?: () => void;
    contextMenuSpeakerIndex: number | null;
    contextMenuLetterIndex: number | null;
    hiddenSpeakerIndices: number[];
    hasSecondaryAccentOnThisCircle: boolean;
    isPrimaryAccentOnThisCircle: boolean;
    onSetPrimaryAccent: () => void;
    onClearPrimaryAccent: () => void;
}

export default class PitchArtContextMenu extends React.Component<Props> {
    render() {
        const isOnCircle = this.props.contextMenuSpeakerIndex !== null && this.props.contextMenuLetterIndex !== null;
        const canHideThisSpeaker = isOnCircle && this.props.onHideThisSpeaker &&
            !this.props.hiddenSpeakerIndices.includes(this.props.contextMenuSpeakerIndex!);
        const hasHiddenSpeakers = this.props.hiddenSpeakerIndices.length > 0 && this.props.onShowAllSpeakers;

        return (
            <div
                style={{
                    position: "absolute",
                    top: this.props.y,
                    left: this.props.x,
                    background: "#fff",
                    border: "1px solid #ccc",
                    padding: "6px 0",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    zIndex: 1000
                }}
                onMouseLeave={this.props.onClose}
            >
                {isOnCircle && (
                    <>
                        {!this.props.isMerged ? (
                            <div
                                style={{ padding: "6px 12px", cursor: "pointer" }}
                                onClick={() => {
                                    this.props.onMergeIndex();
                                    this.props.onClose();
                                }}
                            >
                                Merge index across speakers
                            </div>
                        ) : (
                            <div
                                style={{ padding: "6px 12px", cursor: "pointer" }}
                                onClick={() => {
                                    this.props.onUnmergeIndex();
                                    this.props.onClose();
                                }}
                            >
                                Unmerge index
                            </div>
                        )}

                        <div style={{ borderTop: "1px solid #eee", margin: "6px 0" }} />
                        {!this.props.showAccentPitch && (
                            <div
                                style={{ padding: "6px 12px", cursor: "pointer" }}
                                onClick={() => {
                                    if (this.props.isPrimaryAccentOnThisCircle) {
                                        this.props.onClearPrimaryAccent();
                                    } else {
                                        this.props.onSetPrimaryAccent();
                                    }
                                }}
                            >
                                {this.props.isPrimaryAccentOnThisCircle
                                    ? "Clear primary accent"
                                    : "Set as primary accent"}
                            </div>
                        )}
                        {!this.props.hasSecondaryAccentOnThisCircle ? (
                            <div
                                style={{ padding: "6px 12px", cursor: "pointer" }}
                                onClick={this.props.onAddSecondaryAccent}
                            >
                                Add secondary accent
                            </div>
                        ) : (
                            <div
                                style={{ padding: "6px 12px", cursor: "pointer" }}
                                onClick={() => {
                                    this.props.onRemoveSecondaryAccent();
                                    this.props.onClose();
                                }}
                            >
                                Remove secondary accent
                            </div>
                        )}
                    </>
                )}

                {canHideThisSpeaker && (
                    <>
                        {isOnCircle && <div style={{ borderTop: "1px solid #eee", margin: "6px 0" }} />}
                        <div
                            style={{ padding: "6px 12px", cursor: "pointer" }}
                            onClick={() => {
                                this.props.onHideThisSpeaker!();
                                this.props.onClose();
                            }}
                        >
                            Hide this speaker
                        </div>
                    </>
                )}

                {hasHiddenSpeakers && (
                    <>
                        <div style={{ borderTop: "1px solid #eee", margin: "6px 0" }} />
                        <div
                            style={{ padding: "6px 12px", cursor: "pointer" }}
                            onClick={() => {
                                this.props.onShowAllSpeakers!();
                                this.props.onClose();
                            }}
                        >
                            Show all speakers
                        </div>
                    </>
                )}
            </div>
        );
    }
}
