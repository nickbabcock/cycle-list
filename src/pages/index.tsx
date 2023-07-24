/* OMG everything in one file, what if someone sees this? */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/alert-dialog";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { DragIcon } from "@/icons/DragIcon";
import { PlusIcon } from "@/icons/PlusIcon";
import { TrashIcon } from "@/icons/TrashIcon";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Head from "next/head";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  KeyboardEvent,
  useState,
  useEffect,
  useRef,
} from "react";
import { CheckIcon } from "@/icons/CheckIcon";
import { StoreApi, createStore, useStore, create } from "zustand";
import { SmallTrashIcon } from "@/icons/SmallTrashIcon";
import { GithubIcon } from "@/icons/GithubIcon";
import { ChevronUpIcon } from "@/icons/ChevronUpIcon";
import { nanoid } from "nanoid";

function check<T>(t: T | undefined | null, msg?: string): T {
  if (t === undefined || t === null) {
    throw new Error(msg ?? "unexpected null or undefined");
  } else {
    return t;
  }
}

function keyboardTrigger(cb: () => void) {
  return (ev: KeyboardEvent) => {
    if (ev.key == "Enter") {
      cb();
    }
  };
}

const defaultData = [
  {
    title: "Game Night",
    items: [
      {
        id: "20",
        name: "7 Wonders",
      },
      {
        id: "21",
        name: "Space Base",
      },
      {
        id: "22",
        name: "Kingdom Builder",
      },
      {
        id: "23",
        name: "Azul",
      },
      {
        id: "24",
        name: "Catan",
      },
    ],
  },
  {
    title: "Goto Dinners",
    items: [
      {
        id: "1",
        name: "Mediterranean-Sauteed Shrimp Zucchini",
      },
      {
        id: "2",
        name: "Beef Stroganoff",
      },
      {
        id: "3",
        name: "Italian Lentil Soup",
      },
      {
        id: "4",
        name: "Thai Green Bean Stir-fry",
      },
      {
        id: "5",
        name: "Chickpea Shakshuka",
      },
      {
        id: "6",
        name: "Dill Salmon with Charred Brussel Sprouts",
      },
    ],
  },
];

function formatEpoch(x: number) {
  const result = new Date();
  result.setTime(x);
  return result.toLocaleDateString();
}

type TodoItem = {
  name: string;
  id: string;
  lastChecked?: number;
};

type TodoList = {
  title: string;
  items: TodoItem[];
};

type TodoItemState =
  | {
      kind: "new";
      id: string;
    }
  | ({ kind: "existing" } & TodoItem);

function Item({ item }: { item: TodoItemState }) {
  const newInputRef = useCallback(
    (input: HTMLInputElement) => input?.focus(),
    [],
  );

  const actions = useListActions();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex cursor-pointer items-stretch bg-pink-300 text-base font-semibold tracking-tight shadow-sm dark:bg-pink-800 sm:rounded-md"
      {...attributes}
      tabIndex={-1}
    >
      {item.kind == "existing" ? (
        <>
          <button
            className="peer grow px-4 py-4 text-left hover:bg-pink-400/75 active:bg-pink-400 dark:active:bg-pink-700 sm:rounded-l-md"
            onClick={(e) => {
              actions.completeItem(item);
              e.currentTarget.blur();
            }}
          >
            <div>{item.name}</div>
            {item.lastChecked ? (
              <div className="text-xs italic text-black/50 dark:text-slate-100/50">
                Last checked: {formatEpoch(item.lastChecked)}
              </div>
            ) : null}
          </button>
          <button
            className="opacity-0 focus:opacity-100 group-hover:opacity-100 peer-hover:bg-pink-400/75 peer-focus:opacity-100 peer-active:bg-pink-400 peer-active:opacity-100 peer-active:dark:bg-pink-700 [@media(hover:none)]:opacity-100"
            onClick={() => actions.deleteItem(item)}
          >
            <div className="flex h-10 items-center px-4 text-black/40 hover:text-black/75">
              <SmallTrashIcon />
              <span className="sr-only">Delete {item.name}</span>
            </div>
          </button>

          <button
            className="cursor-grab peer-hover:bg-pink-400/75 peer-active:bg-pink-400 peer-active:dark:bg-pink-700 sm:rounded-r-md [@media(hover:none)]:hidden"
            {...listeners}
          >
            <div className="flex h-10 items-center border-l border-l-pink-800 px-4 dark:border-l-pink-500">
              <DragIcon />
              <span className="sr-only">Drag {item.name}</span>
            </div>
          </button>

          <button
            className="peer-hover:bg-pink-400/75 peer-active:bg-pink-400 peer-active:dark:bg-pink-700 sm:rounded-r-md [@media(hover:hover)]:hidden"
            onClick={() => actions.bumpItemUp(item)}
          >
            <div className="flex h-10 items-center border-l border-l-pink-800 px-4 dark:border-l-pink-500">
              <ChevronUpIcon />
              <span className="sr-only">Up {item.name}</span>
            </div>
          </button>
        </>
      ) : (
        <>
          <input
            ref={newInputRef}
            className="mx-4 my-4 grow border-b border-pink-800 bg-transparent focus:outline-none dark:border-pink-500"
            onBlur={(e) => actions.addItemConfirm(e.currentTarget.value)}
            onKeyDown={(e) =>
              keyboardTrigger(() =>
                actions.addItemConfirm(e.currentTarget.value),
              )(e)
            }
          />
          <button
            className=" hover:text-pink-800 active:text-pink-900"
            onClick={() => {
              // no need to put anything here as the input blur event will catch
            }}
          >
            <div className="flex h-10 items-center border-l border-l-pink-800 px-4 dark:border-l-pink-500">
              <CheckIcon />
              <span className="sr-only">Add new entry</span>
            </div>
          </button>
        </>
      )}
    </div>
  );
}

function DndList() {
  const title = useListTitle();
  const items = useListItems();
  const itemActions = useListActions();
  const listActions = useListsActions();
  const isAddingItem = useIsAddingItem();

  const { listeners, setNodeRef, transform, transition } = useSortable({
    id: title,
  });

  const [animationParent, enableAnimations] = useAutoAnimate();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (
      over &&
      typeof active.id === "string" &&
      typeof over.id === "string" &&
      active.id !== over.id
    ) {
      enableAnimations(false);
      itemActions.moveItem({ id: active.id }, { id: over.id });
      setTimeout(() => enableAnimations(true), 0);
    }
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      className="flex w-full flex-col space-y-4"
      style={style}
    >
      <div className="flex items-center space-x-6 px-4 sm:px-0">
        <h2 className="grow text-2xl font-bold tracking-tight text-gray-800/75 dark:text-gray-300/75">
          {title}
        </h2>
        <button
          className={`hover:text-pink-300/75 focus:text-pink-300/75 active:text-pink-400 ${
            isAddingItem ? "hidden" : ""
          }`}
          onClick={itemActions.addItem}
        >
          <PlusIcon />
          <span className="sr-only">Add item to {title}</span>
        </button>
        <AlertDialog>
          <AlertDialogTrigger className="hover:text-pink-300/75 focus:text-pink-300/75 active:text-pink-400">
            <TrashIcon />
            <span className="sr-only">Delete {title}</span>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {title}?</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => listActions.deleteList({ id: title })}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <button
          className="cursor-grab touch-none [@media(hover:none)]:hidden"
          {...listeners}
        >
          <div className="">
            <DragIcon />
            <span className="sr-only">Drag {title}</span>
          </div>
        </button>
      </div>

      <div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <ul
              ref={animationParent}
              className="flex flex-col items-start space-y-1 sm:space-y-3"
            >
              {items.map((item) => (
                <li className="w-full" key={item.id}>
                  <Item item={item} />
                </li>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

type ListState = {
  title: string;
  items: TodoItemState[];
  actions: {
    addItem: () => void;
    addItemConfirm: (value: string) => void;
    deleteItem: (item: { id: string }) => void;
    completeItem: (item: { id: string }) => void;
    moveItem: (from: { id: string }, to: { id: string }) => void;
    bumpItemUp: (item: { id: string }) => void;
  };
};

type ListStore = StoreApi<ListState>;
const ListContext = createContext<ListStore | null>(null);
function createListStore(list: TodoList) {
  const initialItems = list.items.map(
    (x) => ({ ...x, kind: "existing" }) as const,
  );

  const store = createStore<ListState>()((set, get) => ({
    title: list.title,
    items: initialItems,
    actions: {
      addItem() {
        set({ items: [{ kind: "new", id: nanoid() }, ...get().items] });
      },

      addItemConfirm(value) {
        if (!value) {
          set({ items: get().items.slice(1) });
        } else {
          const item = get().items[0];
          if (item?.kind !== "new") {
            throw new Error("can only confirm new items");
          }

          set({
            items: [
              { kind: "existing", id: item.id, name: value },
              ...get().items.slice(1),
            ],
          });
          updateMainStore();
        }
      },

      deleteItem(item) {
        const items = get().items.slice();
        const index = items.findIndex((x) => x.id == item.id);
        items.splice(index, 1);
        set({ items });
        updateMainStore();
      },

      completeItem(item) {
        const items = get().items;
        const oldIndex = items.findIndex((x) => x.id == item.id);
        const newItem = check(items.splice(oldIndex, 1)[0], "unable to splice");
        if (newItem.kind !== "existing") {
          throw new Error("able to complete only existing items");
        }

        set({
          items: [
            ...items,
            {
              ...newItem,
              lastChecked: +new Date(),
            },
          ],
        });
        updateMainStore();
      },

      moveItem(from, to) {
        const items = get().items;
        const oldIndex = items.findIndex((item) => item.id == from.id);
        const newIndex = items.findIndex((item) => item.id == to.id);
        set({ items: arrayMove(items, oldIndex, newIndex) });
        updateMainStore();
      },

      bumpItemUp(item) {
        const items = get().items;
        const oldIndex = items.findIndex((x) => x.id == item.id);
        set({ items: arrayMove(items, oldIndex, Math.max(oldIndex - 1, 0)) });
        updateMainStore();
      },
    },
  }));

  const updateMainStore = () => {
    useCyclelistStore.getState().actions.updateList({
      title: store.getState().title,
      items: store
        .getState()
        .items.filter(
          (x): x is Extract<TodoItemState, { kind: "existing" }> =>
            x.kind === "existing",
        ),
    });
  };

  return store;
}

function useListContext() {
  return check(useContext(ListContext), "Missing List Context");
}

function useListStore<T>(
  selector: (state: ListState) => T,
  equalityFn?: (left: T, right: T) => boolean,
): T {
  return useStore(useListContext(), selector, equalityFn);
}

export const useListItems = () => useListStore((x) => x.items);
export const useListTitle = () => useListStore((x) => x.title);
export const useListActions = () => useListStore((x) => x.actions);
export const useIsAddingItem = () => useListItems()[0]?.kind === "new";

function ListProvider({
  list,
  children,
}: React.PropsWithChildren<{ list: TodoList }>) {
  const store = useMemo(() => createListStore(list), [list]);
  return <ListContext.Provider value={store}>{children}</ListContext.Provider>;
}

function CycleLists({ data }: { data: TodoList[] }) {
  const actions = useListsActions();
  const items = useMemo(() => data.map((x) => ({ ...x, id: x.title })), [data]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (
      over &&
      typeof active.id === "string" &&
      typeof over.id === "string" &&
      active.id !== over.id
    ) {
      actions.moveList({ id: active.id }, { id: over.id });
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={rectSortingStrategy}>
          {data.map((x) => (
            <ListProvider key={x.title} list={x}>
              <DndList />
            </ListProvider>
          ))}
        </SortableContext>
      </DndContext>
    </>
  );
}

type CyclelistState = {
  lists: TodoList[];

  actions: {
    readFromStorage: () => string | null;
    loadFromStorage: () => void;
    saveToStorage: () => void;
    addList: (title: string) => "accepted" | "denied";
    deleteList: (list: { id: string }) => void;
    moveList: (from: { id: string }, to: { id: string }) => void;
    updateList: (list: TodoList) => void;
  };
};

const useCyclelistStore = create<CyclelistState>()((set, get) => ({
  lists: [],
  actions: {
    readFromStorage() {
      try {
        return localStorage.getItem("lists");
      } catch (ex) {
        console.error(ex);
        return null;
      }
    },

    loadFromStorage() {
      try {
        const stored = get().actions.readFromStorage();
        const lists = stored !== null ? JSON.parse(stored) : defaultData;
        set({ lists });
      } catch (ex) {
        console.error(ex);
      }
    },

    saveToStorage() {
      try {
        localStorage.setItem("lists", JSON.stringify(get().lists));
      } catch (ex) {
        console.error(ex);
      }
    },

    addList(title: string) {
      if (!title) {
        return "denied";
      }

      const lists = get().lists;
      if (lists.findIndex((x) => x.title == title) !== -1) {
        return "denied";
      }

      set({ lists: [{ title, items: [] }, ...lists] });
      get().actions.saveToStorage();
      return "accepted";
    },

    moveList(from: { id: string }, to: { id: string }) {
      const lists = get().lists;
      const oldIndex = lists.findIndex((list) => list.title == from.id);
      const newIndex = lists.findIndex((list) => list.title == to.id);
      set({ lists: arrayMove(lists, oldIndex, newIndex) });
      get().actions.saveToStorage();
    },

    deleteList(list: { id: string }) {
      const lists = get().lists.slice();
      const oldIndex = lists.findIndex((x) => x.title == list.id);
      lists.splice(oldIndex, 1);
      set({ lists });
      get().actions.saveToStorage();
    },

    updateList(list: TodoList) {
      const lists = get().lists.slice();
      const index = lists.findIndex((x) => x.title == list.title);
      lists[index] = list;
      set({ lists });
      get().actions.saveToStorage();
    },
  },
}));

function useLists() {
  const { lists, actions } = useCyclelistStore();

  useEffect(() => {
    actions.loadFromStorage();
  }, [actions]);

  return lists;
}

const useListsActions = () => useCyclelistStore((x) => x.actions);

function NewListInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const actions = useListsActions();

  function addNewList() {
    if (inputRef.current !== null) {
      const result = actions.addList(inputRef.current.value);
      console.log(result);
      if (result === "accepted") {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="mt-8 flex gap-2">
      <label htmlFor="add-new-list-input" className="sr-only">
        Add a new list
      </label>
      <input
        ref={inputRef}
        id="add-new-list-input"
        className="peer w-[264px] border-b border-b-orange-200 bg-transparent text-2xl font-bold tracking-tight placeholder:text-orange-300 focus:outline-none"
        placeholder="Add a new list"
        onBlur={addNewList}
        onKeyDown={keyboardTrigger(addNewList)}
      />
      <button
        className="opacity-0 transition-opacity hover:text-pink-300/75 focus:text-pink-300/75 focus:opacity-100 active:text-pink-400 peer-focus:opacity-100"
        onClick={() => addNewList()}
      >
        <PlusIcon />
        <span className="sr-only">Add list</span>
      </button>
    </div>
  );
}

function useIsFirstTime() {
  const actions = useListsActions();
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    setIsFirstTime(actions.readFromStorage() == null);
  }, [actions]);

  return isFirstTime;
}

export default function Home() {
  const data = useLists();
  const isFirstTime = useIsFirstTime();
  const [animationParent] = useAutoAnimate();

  return (
    <>
      <Head>
        <title>Cycle • List</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="dark light" />
        <link rel="icon" href="/favicon.ico" />

        <meta
          name="description"
          content="CycleList is a cyclical activity tracker, useful for highlighting least recently eaten dinners, workouts, cleaning, etc."
        />
        <meta
          property="og:description"
          content="CycleList is a cyclical activity tracker, useful for highlighting least recently eaten dinners, workouts, cleaning, etc."
        />

        <meta property="og:title" content="CycleList" />
        <meta property="og:site_name" content="Cycle • List" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://cyclelist.nickb.dev/og.png"
        />
        <meta property="og:image:width" content="2532" />
        <meta property="og:image:height" content="1318" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:url" content="https://cyclelist.nickb.dev" />
      </Head>
      <main
        className="grid grid-cols-[repeat(auto-fill,_minmax(360px,_auto))] gap-12 sm:p-6 md:p-8 lg:p-10 xl:p-12"
        ref={animationParent}
      >
        <div className="max-w-md p-4 sm:p-0">
          <div className="flex items-center">
            <h1 className="grow whitespace-nowrap text-4xl font-extrabold tracking-tight sm:text-6xl">
              Cycle • List
            </h1>
            <a
              className="block w-8"
              href="https://github.com/nickbabcock/cycle-list"
            >
              <GithubIcon alt="CycleList Github Repo" />
            </a>
          </div>
          <p className="mt-4 text-xl">
            {"Keeping track of life's cyclical activities"}
          </p>
          {isFirstTime ? (
            <>
              <p className="mt-4 text-xl">
                Try selecting an item to cause it to fall to the bottom of the
                list!
              </p>
              <p className="mt-4 text-xl">
                Your lists are stored locally in the browser
              </p>
            </>
          ) : null}

          <NewListInput />
        </div>
        <CycleLists data={data} />
      </main>
    </>
  );
}
