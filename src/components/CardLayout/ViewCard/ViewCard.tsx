import "../../../css/viewCard.css";

import classNames from "classnames";
import type { Action, Thunk } from "easy-peasy";
import { action, thunk, useLocalStore } from "easy-peasy";
import type { FC, MouseEventHandler, ReactNode, SyntheticEvent } from "react";
import React, { useEffect, useRef, useState } from "react";
import type { Layouts } from "react-grid-layout";
import QRCode from "react-qr-code";

import type CardData from "../../../data_structs/CardData";
import type WidgetData from "../../../data_structs/WidgetData";
import type { DndTypes } from "../../../enums";
import { AppMode, CardView } from "../../../enums";
import {
  useApp,
  useCardEditor,
  useKeyboardShortcut,
  useLayout,
  useOnClickOutside,
  useStoreState,
} from "../../../hooks";
import type { CardSettings } from "../../../interfaces/CardSettings";
import Button from "../../Shared/Button";
import CardBackdrop from "./CardBackdrop";
import CardInfo from "./CardInfo";
import CardMotionWrapper from "./CardMotionWrapper";
import DeleteButton from "./DeleteButton";
import SettingsButton from "./SettingsButton";
/**
 * Wraps each of the cards in the card layouts.
 */
export interface CardModel {
  cardBackgroundColor: string;
  cardType: DndTypes;
  cardView: CardView;
  handleCardPress: Thunk<CardModel>;
  scale: number;
  setBackgroundColor: Action<CardModel, string>;
  setCardView: Action<CardModel, CardView>;
  setScale: Action<CardModel, number>;
  setShowMenu: Action<CardModel, boolean>;
  showMenu: boolean;
  toggleMenu: Action<CardModel>;
}

export type CardErrorHandler = (
  event: SyntheticEvent<HTMLDivElement | HTMLIFrameElement | HTMLImageElement>,
  card: CardData
) => void;
export type CardLoadHandler = (
  event: SyntheticEvent<HTMLDivElement | HTMLIFrameElement | HTMLImageElement>,
  card: CardData
) => void;

interface ViewCardProperties {
  cardId?: string;
  cardSettings?: CardSettings;
  cardType: DndTypes;
  children?: (
    scale: number,
    cardView: CardView,
    onError: CardErrorHandler,
    onLoad: CardLoadHandler,
    cardSettings: CardSettings
  ) => ReactNode;
  data?: CardData | WidgetData;
  dataGrid?: Layouts;
  onClick?: () => void;
  useAnimation: boolean;
}

const ViewCard: FC<ViewCardProperties> = ({
  cardType,
  children,
  cardId,
  data,
  onClick,
  cardSettings,
  useAnimation,
}: ViewCardProperties) => {
  const { appMode, addAppError, setEditingCard } = useApp();
  const { deleteCard } = useLayout();
  const [oldCardView, setCardView] = useState(CardView.GRID);
  const [isError, setIsError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [animationVariant, setAnimationVariant] = useState(
    data?.contentType === "widget" ? "loaded" : ""
  );

  const { setCardScale } = useCardEditor();

  const animationCounter = useStoreState(
    (state) => state.layoutsModel.animationCounter
  );

  useEffect(() => {
    if (appMode === AppMode.DISPLAY) {
      setAnimationVariant("out");
    }
    if (data?.contentType === "widget") {
      setAnimationVariant("loaded");
    }
  }, [animationCounter, appMode, data?.contentType]);

  const [state, actions] = useLocalStore<CardModel>(
    () => ({
      cardBackgroundColor: "",
      cardType: cardType,
      cardView: CardView.GRID,
      handleCardPress: thunk((actions, _, { getState }) => {
        const rootel = document.querySelector("#root") as HTMLDivElement;
        if ((rootel.style.pointerEvents = "all")) {
          rootel.style.pointerEvents = "none";
        }

        setTimeout(() => {
          rootel.style.pointerEvents = "all";
        }, 1000);
        if (appMode === AppMode.DISPLAY && cardId != undefined) {
          switch (getState().cardView) {
            case CardView.GRID:
              break;
            case CardView.PREVIEW:
              actions.setCardView(CardView.GRID);
              const element = document.getElementById(
                data?.id ?? "view_card"
              ) as HTMLDivElement;
              element.style.zIndex = "0";
              break;
            default:
              break;
          }
        }
      }),
      scale: cardSettings?.scale ?? 1,
      setBackgroundColor: action((state, color) => {
        state.cardBackgroundColor = color;
      }),
      setCardView: action((state, cardView) => {
        state.cardView = cardView;
      }),
      setScale: action((state, scale) => {
        state.scale += scale;
        if (data) {
          setCardScale({ cardId: data?.id, scale: state.scale });
        }
      }),
      setShowMenu: action((state, show) => {
        state.showMenu = show;
      }),
      showMenu: false,
      toggleMenu: action((state) => {
        state.showMenu = !state.showMenu;
      }),
    }),
    [appMode],
    () => {
      return { devTools: false };
    }
  );

  const cardModalBackdrop = classNames("card-modal-backdrop", {
    "card-modal-backdrop-active":
      oldCardView === CardView.PREVIEW || oldCardView === CardView.FULL_SCREEN,
    "card-modal-backdrop-inactive": oldCardView === CardView.GRID,
  });

  const cardChildContainer = classNames("card-child-container", {
    "card-child-container-preview": state.cardView === CardView.PREVIEW,
    "card-child-container-fullscreen": state.cardView === CardView.FULL_SCREEN,
    "card-child-container-grid": state.cardView === CardView.GRID,
  });

  const { enable, disable } = useKeyboardShortcut({
    keyCode: 27, //escape
    action: () => {
      if (
        oldCardView === CardView.FULL_SCREEN ||
        oldCardView === CardView.PREVIEW
      ) {
        setCardView(CardView.GRID);
      }
    },
    disabled: false,
  });

  const showDeleteButton = (): JSX.Element | undefined => {
    if (appMode == AppMode.EDIT && data) {
      return (
        <>
          <DeleteButton
            action={() => {
              deleteCard(data.id);
            }}
            onClick={() => {
              deleteCard(data.id);
            }}
          />
          {data.contentType !== "widget" && (
            <SettingsButton
              onClick={(e) => {
                if (data.contentType !== "widget") {
                  setEditingCard(data as CardData);
                }
              }}
            />
          )}
        </>
      );
    }
  };

  const renderCardInfo = (): JSX.Element | undefined => {
    if (
      oldCardView === CardView.PREVIEW &&
      data &&
      data.contentType !== "widget"
    ) {
      return <CardInfo className="" data={data as CardData} />;
    }
  };

  const renderInternals = () => {
    return data?.contentType !== "widget"
      ? [showDeleteButton(), renderCardInfo()]
      : [showDeleteButton()];
  };

  const renderReturnButton = (): JSX.Element | undefined => {
    if (oldCardView === CardView.FULL_SCREEN) {
      return (
        <ReturnButton
          onClick={() => {
            setCardView(CardView.GRID);
          }}
        />
      );
    }
  };

  const containerReference = useRef(null);
  useOnClickOutside(containerReference, (e) => {
    e.preventDefault();
    if (state.cardView == CardView.PREVIEW) {
      actions.setCardView(CardView.GRID);
    }
  });

  const qrContainerStyle = {
    bottom: 0,
    position: "absolute",
    right: 0,
    transform: "translate(50%, 50%)",
    width: "fit-content",
    zIndex: 1,
  } as React.CSSProperties;

  const renderQrCode = (): JSX.Element | undefined => {
    if (state.cardView === CardView.PREVIEW && data?.contentType !== "widget") {
      const cd = data as CardData;
      return (
        <div style={qrContainerStyle}>
          <QRCode size={128} value={cd?.src ?? ""} />
        </div>
      );
    }
  };

  const onError: CardErrorHandler = (event, card) => {
    const { title, src } = card;
    addAppError({
      errorType: "failed to load content",
      description: "description",
      source: `Card: ${title}`,
      link: src,
    });
    setIsError(true);
  };

  const onLoad: CardLoadHandler = (event, card) => {
    if (appMode === AppMode.DISPLAY) {
      setAnimationVariant("loaded");
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    if (state.cardView === CardView.PREVIEW) {
      // setAnimationVariant("preview");
    }
    if (state.cardView === CardView.GRID) {
      // setAnimationVariant("none");
    }
    // if (state.)
  }, [state.cardView]);

  useEffect(() => {
    console.log(animationVariant);
  }, [animationVariant]);

  return (
    <>
      {data && (
        <CardMotionWrapper
          animation={animationVariant}
          backgroundColor={state.cardBackgroundColor}
          card={data}
        >
          {children && (
            <div className={cardModalBackdrop}>
              <div
                className={cardChildContainer}
                onMouseUp={() => {
                  actions.handleCardPress();
                  if (onClick) {
                    onClick();
                  }
                }}
                ref={containerReference}
              >
                {/* {renderQrCode()} */}
                {renderInternals()}
                <CardBackdrop card={data} cardSettings={cardSettings}>
                  {children(
                    state.scale,
                    state.cardView,
                    onError,
                    onLoad,
                    cardSettings ?? {
                      id: "not found",
                      scale: 1,
                    }
                  )}
                </CardBackdrop>
              </div>
              {renderReturnButton()}
            </div>
          )}
        </CardMotionWrapper>
      )}
    </>
  );
};

const calculateTransform2 = (boundingBox: DOMRect): [number, number] => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const vw = window.innerWidth / 100;
  const vh = window.innerWidth / 100;
  const futureWidth = boundingBox.width * 1.5;
  const futureHeight = boundingBox.height * 1.5;

  const centeredX = windowWidth / 2 - futureWidth / 2;
  const centeredY = windowHeight / 2 - futureHeight / 2;

  const currentX = boundingBox.x;
  const currentY = boundingBox.y;
  let differenceX = centeredX - currentX;
  let differenceY = centeredY - currentY;

  if (centeredX < currentX) {
    differenceX = currentX - centeredX;
    differenceX *= -1;
  }
  if (centeredY < currentY) {
    differenceY = currentY - centeredY;
    differenceY *= -1;
  }
  return [differenceX, differenceY];
};

const ReturnButton = ({
  onClick,
}: {
  onClick: MouseEventHandler<HTMLDivElement>;
}): JSX.Element => {
  return (
    <div className="return-button-container">
      <Button onClick={onClick} text="Return" width={300} />
    </div>
  );
};

export default React.memo(ViewCard);
