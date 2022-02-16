import React, { useState, useEffect } from "react";
import {
  useStoreState,
  useStoreActions,
  useWindowSize,
} from "../../../../hooks";
import IXDrop from "../../../DragAndDrop/IXDrop";
import XDrag from "../../../DragAndDrop/DraggableRow";
import { AppMode, DndTypes, DragSource } from "../../../../enums";
import { StatusIndicator } from "evergreen-ui";
import { formatDate } from "../../../../utils";
import "../../../../css/table.css";
import PopOver from "../../PopOver";
import CardLayout from "../../../CardLayout/CardLayout";
import LayoutData from "../../../../data_structs/LayoutData";
/**
 * Table for displaying the available card layouts
 * @returns
 */

const LayoutTable = (): JSX.Element => {
  const externalLayoutsState = useStoreState(
    (state) => state.layoutsModel.externalLayouts
  );
  const activeLayoutState = useStoreState(
    (state) => state.layoutsModel.activeLayout
  );

  const setActiveLayoutAction = useStoreActions(
    (actions) => actions.layoutsModel.setActiveLayout
  );
  return (
    <div>
      <IXDrop
        className={"table-container"}
        droppableId={DragSource.LAYOUT_TABLE}
        isDropDisabled={false}
        cardType={DndTypes.CLOCK}
      >
        <table>
          <tbody>
            <tr>
              <th>Title</th>
              <th>Date Added</th>
              <th>Author</th>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            {externalLayoutsState.map((l, index) => {
              const { id, title, author, added } = l;
              return (
                <tr key={index} onClick={(e) => setActiveLayoutAction(l)}>
                  <td
                    key={index}
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    {id === activeLayoutState?.id && (
                      <StatusIndicator color="success" />
                    )}
                    <LayoutTitle layout={l} />
                  </td>
                  <td>{formatDate(added)}</td>
                  <td>{author}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </IXDrop>
    </div>
  );
};

export default LayoutTable;

const LayoutTitle = ({ layout }: { layout: LayoutData }): JSX.Element => {
  const [hovered, setHovered] = useState(false);

  const [position, setPosition] = useState([0, 0]);
  const { title } = layout;
  const { width, height } = useWindowSize();
  const scale = 0.5;

  const layoutCardIds = layout.sources();
  const layoutWidgetsIds = layout.widgets();

  const cards = useStoreState((state) =>
    state.appModel.availableCards.filter((c) => layoutCardIds.includes(c.src))
  );

  const widgets = useStoreState((state) =>
    state.appModel.availableWidgets.filter((c) =>
      layoutWidgetsIds.includes(c.id)
    )
  );

  // const appMod
  return (
    <div>
      <div
        onMouseEnter={(e) => {
          const { pageX, pageY } = e;
          setPosition([pageX, pageY]);
          setHovered(true);
        }}
        onMouseLeave={(e) => {
          setHovered(false);
        }}
        style={{
          textDecoration: hovered ? "underline" : "",
        }}
      >
        {title}
      </div>

      <PopOver
        width={width * scale}
        height={height * scale}
        x={position[0]}
        y={position[1]}
        visible={hovered}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "inherit",
            height,
            width,
          }}
        >
          <CardLayout
            width={width}
            height={height}
            layout={layout}
            margin={[20, 20]}
            appMode={AppMode.DISPLAY}
            onLayoutChange={(l) => {}}
            cards={cards}
            widgets={widgets}
          />
        </div>
      </PopOver>
    </div>
  );
};
