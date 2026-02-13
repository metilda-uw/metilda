import React from "react";

interface Props {
    x: number;
    y: number;
    onAddSecondaryAccent: () => void;
    onRemoveSecondaryAccent: () => void;
    onClose: () => void;
    isMerged: boolean;
    onMergeIndex: () => void;
    onUnmergeIndex: () => void;
}

export default class PitchArtContextMenu extends React.Component<Props> {
    render() {
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
                <div
                    style={{ padding: "6px 12px", cursor: "pointer" }}
                    onClick={this.props.onAddSecondaryAccent}
                >
                    Add secondary accent
                </div>
                <div
                    style={{ padding: "6px 12px", cursor: "pointer" }}
                    onClick={() => {
                        this.props.onRemoveSecondaryAccent();
                        this.props.onClose();
                    }}
                >
                    Remove secondary accent
                </div>
            </div>
        );
    }
}
