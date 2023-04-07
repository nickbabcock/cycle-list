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
  useRef,
  KeyboardEvent,
  useState,
} from "react";
import { CheckIcon } from "@/icons/CheckIcon";
import { StoreApi, createStore, useStore } from "zustand";
import { PencilIcon } from "@/icons/PencilIcon";
import { SmallTrashIcon } from "@/icons/SmallTrashIcon";

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
];

let nextId = 10;

type TodoItem = {
  name: string;
  id: string;
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
    []
  );

  const actions = useListActions();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  // className="w-full flex items-center cursor-pointer rounded-md bg-pink-300 px-4 py-4 text-base font-semibold tracking-tight shadow-sm hover:bg-pink-300/75 focus:outline focus:outline-2 focus:outline-pink-400 focus-visible:outline-2 focus-visible:outline-offset-2 active:bg-pink-400 dark:bg-pink-800 dark:active:bg-pink-700"

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex cursor-pointer items-stretch rounded-md  bg-pink-300 text-base font-semibold tracking-tight shadow-sm dark:bg-pink-800"
      {...attributes}
      tabIndex={-1}
    >
      {item.kind == "existing" ? (
        <>
          <button
            className="peer grow rounded-l-md px-4 py-4 text-left hover:bg-pink-400/75 active:bg-pink-400 dark:active:bg-pink-700"
            onClick={() => actions.completeItem(item)}
          >
            {item.name}
          </button>
          <button
            className="opacity-0 focus:opacity-100 group-hover:opacity-100 peer-hover:bg-pink-400/75 peer-focus:opacity-100 peer-active:bg-pink-400 peer-active:dark:bg-pink-700"
            onClick={() => actions.deleteItem(item)}
          >
            <div className="flex h-10 items-center px-4 text-black/40 hover:text-black/75">
              <SmallTrashIcon />
              <span className="sr-only">Delete {item.name}</span>
            </div>
          </button>

          <button
            className="cursor-grab rounded-r-md peer-hover:bg-pink-400/75 peer-active:bg-pink-400 peer-active:dark:bg-pink-700"
            {...listeners}
          >
            <div className="flex h-10 items-center border-l border-l-pink-800 px-4 dark:border-l-pink-500">
              <DragIcon />
              <span className="sr-only">Drag {item.name}</span>
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
                actions.addItemConfirm(e.currentTarget.value)
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
  const actions = useListActions();
  const isAddingItem = useIsAddingItem();

  const { listeners, setNodeRef, transform, transition } = useSortable({
    id: title,
  });

  const [animationParent, enableAnimations] = useAutoAnimate();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
      actions.moveItem({ id: active.id }, { id: over.id });
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
      className="flex w-full max-w-md flex-col space-y-4"
      style={style}
    >
      <div className="flex items-center space-x-6">
        <h2 className="grow text-2xl font-bold tracking-tight text-gray-800/75 dark:text-gray-300/75">
          {title}
        </h2>
        <button
          className={`hover:text-pink-300/75 focus:text-pink-300/75 active:text-pink-400 ${
            isAddingItem ? "hidden" : ""
          }`}
          onClick={actions.addItem}
        >
          <PlusIcon />
          <span className="sr-only">Add item to {title}</span>
        </button>
        <button className="hover:text-pink-300/75 focus:text-pink-300/75 active:text-pink-400">
          <PencilIcon />
          <span className="sr-only">Edit {title}</span>
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
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <button className="cursor-grab" {...listeners}>
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
              className="flex flex-col items-start space-y-3"
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
    deleteList: () => void;
    completeItem: (item: { id: string }) => void;
    moveItem: (from: { id: string }, to: { id: string }) => void;
  };
};

type ListStore = StoreApi<ListState>;
const ListContext = createContext<ListStore | null>(null);
function createListStore(list: TodoList) {
  const initialItems = list.items.map(
    (x) => ({ ...x, kind: "existing" } as const)
  );
  const store = createStore<ListState>()((set, get) => ({
    title: list.title,
    items: initialItems,
    actions: {
      addItem() {
        set({ items: [{ kind: "new", id: `${nextId}` }, ...get().items] });
      },

      addItemConfirm(value: string) {
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
        }
      },

      deleteItem(item) {
        const items = get().items.slice();
        const index = items.findIndex((x) => x.id == item.id);
        items.splice(index, 1);
        set({ items });
      },

      completeItem(item: { id: string }) {
        const items = get().items;
        const oldIndex = items.findIndex((x) => x.id == item.id);
        set({ items: arrayMove(items, oldIndex, items.length - 1) });
      },

      moveItem(from: { id: string }, to: { id: string }) {
        const items = get().items;
        const oldIndex = items.findIndex((item) => item.id == from.id);
        const newIndex = items.findIndex((item) => item.id == to.id);
        set({ items: arrayMove(items, oldIndex, newIndex) });
      },

      deleteList() {},
    },
  }));

  return store;
}

function useListContext() {
  return check(useContext(ListContext), "Missing List Context");
}

function useListStore<T>(
  selector: (state: ListState) => T,
  equalityFn?: (left: T, right: T) => boolean
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
  const [animationParent] = useAutoAnimate();
  const items = useMemo(() => data.map((x) => ({ ...x, id: x.title })), [data]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (
      over &&
      typeof active.id === "string" &&
      typeof over.id === "string" &&
      active.id !== over.id
    ) {
      // actions.moveItem({ id: active.id }, { id: over.id });
    }
  }

  return (
    <div ref={animationParent} className="flex flex-wrap gap-12">
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
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState(defaultData);

  const addNewList = () => {
    const input = document.querySelector<HTMLInputElement>(
      "#add-new-list-input"
    );
    if (!input) {
      throw new Error("missing input");
    }

    if (!input.value) {
      return;
    }

    if (data.findIndex((x) => x.title == input.value) !== -1) {
      return;
    }

    setData([{ title: input.value, items: [] }, ...data]);
    input.value = "";
  };

  return (
    <>
      <Head>
        <title>Cycle • List</title>
        <meta
          name="description"
          content="Cycle List is a cyclical activity tracker, useful for highlighting least recently eaten dinners, workouts, cleaning, etc."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
        <div className="mb-8 flex flex-col space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Cycle • List
          </h1>
          <p className="text-xl">
            {"Keeping track of life's cyclical activities"}
          </p>
        </div>
        <div className="flex flex-col items-start gap-12 lg:grid">
          <div className="flex gap-2">
            <label htmlFor="add-new-list-input" className="sr-only">
              Add a new list
            </label>
            <input
              id="add-new-list-input"
              className="peer w-[264px] border-b bg-transparent text-2xl font-bold tracking-tight focus:outline-none"
              placeholder="Add a new list"
              onBlur={addNewList}
              onKeyDown={keyboardTrigger(addNewList)}
            />
            <button
              className="opacity-0 transition-opacity hover:text-pink-300/75 focus:text-pink-300/75 focus:opacity-100 active:text-pink-400 peer-focus:opacity-100"
              onClick={() => {
                addNewList();
              }}
            >
              <PlusIcon />
              <span className="sr-only">Add list</span>
            </button>
          </div>
          <CycleLists data={data} />
        </div>
      </main>
    </>
  );
}
