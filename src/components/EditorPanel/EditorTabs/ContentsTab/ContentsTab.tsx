import "../../../../css/table.css";

import { SearchInput } from "evergreen-ui";
import fuzzysort from "fuzzysort";
import React, { useEffect, useState } from "react";
import { Scrollbars } from "react-custom-scrollbars";
import ReactImageFallback from "react-image-fallback";

import CardData from "../../../../data_structs/CardData";
import { CardView, DndTypes, DragSource } from "../../../../enums";
import { useLayout, useStoreState } from "../../../../hooks";
import { formatDate } from "../../../../utils";
import DraggableRow from "../../../DragAndDrop/DraggableRow";
import IXDrop from "../../../DragAndDrop/IXDrop";
import IFrameView from "../../../IFrameView";
import Loader from "../../../Loader";
import Button from "../../../Shared/Button";
import FlexRow from "../../../Shared/FlexRow";
import PopOver from "../../PopOver";
import TableHeader from "../../TableHeader";

/**
 * Content tab display a list of the availalbe cards, and search bar for quickly finding cards by their title.
 */

const ContentsTab = (): JSX.Element => {
  const availableCards = useStoreState(
    (state) => state.appModel.availableCards
  );

  const { clearCards, resetLayout } = useLayout();

  const [filterKey, setFilterKey] = useState<string | undefined>();
  const [filterDirection, setFilterDirection] = useState(true);
  const [cardItems, setCardItems] = useState(availableCards);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCards, setFilteredCards] =
    useState<CardData[]>(availableCards);

  //use search input to filter cards
  useEffect(() => {
    if (0 < searchTerm.length) {
      const sortResult = fuzzysort.go(
        searchTerm,
        cardItems.map((c) => c.title)
      );
      const aboveThreshholdCardTitles: string[] = sortResult.map(
        (s) => s.target
      );
      const filtered = cardItems.filter((c) =>
        aboveThreshholdCardTitles.includes(c.title)
      );
      setFilteredCards(filtered);
    } else {
      setFilteredCards(cardItems);
    }
  }, [searchTerm, cardItems]);

  //sort values by column attribute, if filterDirection is true, sort descending, else sort ascending
  useEffect(() => {
    const key = filterKey as keyof CardData;
    const clone = [...availableCards];

    const sortedItems = clone.sort((a, b) => {
      const aText = a[key];
      const bText = b[key];
      if (aText && bText) {
        if (aText < bText) {
          return -1;
        }
        if (bText < aText) {
          return 1;
        }
      }
      return 0;
    });
    !filterDirection ? sortedItems.reverse() : null;
    setCardItems(sortedItems);
  }, [filterKey, availableCards, filterDirection]);

  const contentTabHeader = "contents-table-header";
  return (
    <div className="contents-tab-container">
      <FlexRow style={{ padding: "0.5em" }}>
        <SearchInput
          onChange={(event: React.FormEvent<HTMLInputElement>) =>
            setSearchTerm(event.currentTarget.value)
          }
          placeholder="search title"
          width="80%"
        />
        <Button
          appearance="default"
          intent="danger"
          onClick={(_event) => {
            resetLayout();
          }}
          text="Reset Layout"
        />
        <Button
          appearance="minimal"
          intent="danger"
          onClick={(_event) => {
            clearCards();
          }}
          // width={"10%"}
          text="Clear All"
        />
      </FlexRow>
      <IXDrop
        cardType={DndTypes.CLOCK}
        className="table-container"
        droppableId={DragSource.CARD_TABLE}
        isDropDisabled
      >
        <table className="contents-tab-table">
          <tbody>
            <tr>
              {["title", "author", "added"].map((s, index) => {
                return (
                  <TableHeader
                    activeFilter={filterKey}
                    className={contentTabHeader}
                    headerTitle={s}
                    key={index}
                    setFilter={setFilterKey}
                    setFilterDirection={setFilterDirection}
                  ></TableHeader>
                );
              })}
            </tr>
          </tbody>
        </table>
        <Scrollbars autoHeight autoHeightMax={319} autoHeightMin={100}>
          <table style={{ padding: "2em" }}>
            <tbody>
              {filteredCards.map((card, index) => {
                const { added, id, author, interaction, isActive } = card;
                return (
                  <DraggableRow
                    className={
                      isActive ? "content-row-active" : "content-row-inactive"
                    }
                    card={card}
                    dndType={DndTypes.CARD_ROW}
                    draggableId={id}
                    index={index}
                    isDragDisabled={isActive}
                    key={index.toString()}
                  >
                    <>
                      <td>
                        <TitleWithIcon card={card} />
                      </td>
                      <td>{author}</td>
                      <td>{formatDate(added)}</td>
                    </>
                  </DraggableRow>
                );
              })}
            </tbody>
          </table>
        </Scrollbars>
      </IXDrop>
    </div>
  );
};

/**
 * Fetches a favicon for a card and displays the cards title
 */
const TitleWithIcon = ({ card }: { card: CardData }): JSX.Element => {
  const { src, id, title } = card;

  const iconId = id + "_icon";

  const [position, setPosition] = useState([0, 0]);
  const [hovered, setHovered] = useState(false);

  const [preivewLoaded, setPreviewLoaded] = useState(false);
  const [delayHandler, setDelayHandler] = useState<NodeJS.Timeout>();

  const handleMouseEnter = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void => {
    setDelayHandler(
      setTimeout(() => {
        const { pageY } = event;
        const el = document.getElementById(iconId)
          ?.parentElement as HTMLDivElement;
        const { x } = el.getBoundingClientRect();
        setPosition([x + 100, pageY]);
        setHovered(true);
      }, 250)
    );
  };

  const handleMouseLeave = (
    _event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void => {
    if (delayHandler) {
      clearTimeout(delayHandler);
      setHovered(false);
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: "flex" }}
    >
      <div id={iconId} style={{ display: "flex", width: 20 }}>
        <ReactImageFallback
          className={
            card.isActive ? "row-favicon-active" : "row-favicon-inactive"
          }
          fallbackImage={`${process.env.PUBLIC_URL}/question_mark.svg`}
          src={
            card.contentType === "image"
              ? src
              : `https://s2.googleusercontent.com/s2/favicons?domain_url=${card.src}`
          }
          style={{ width: "100%", maxWidth: 20 }}
        />
      </div>
      <PopOver visible={hovered} x={position[0]} y={position[1]}>
        <IFrameView
          card={card}
          cardView={CardView.GRID}
          objectFit={"contain"}
          onError={(_c) => {}}
          onLoad={(_c) => {
            setPreviewLoaded(true);
          }}
          scale={1}
        />
      </PopOver>
      <div
        style={{
          marginTop: "auto",
          marginBottom: "auto",
          textAlign: "left",
          paddingLeft: "1em",
        }}
      >
        {title}
      </div>
    </div>
  );
};

export default ContentsTab;

const LoaderOverlay = ({ visible }: { visible: boolean }): JSX.Element => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "red",
        position: "absolute",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Loader visible={true} />
    </div>
  );
};
