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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Head from "next/head";
import { useState } from "react";

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
];

type TodoItem = {
  name: string;
  id: string;
};

type TodoList = {
  title: string;
  items: TodoItem[];
};

function Item({
  item,
  onClick,
}: {
  item: TodoItem;
  onClick: (item: TodoItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  // className="w-full flex items-center cursor-pointer rounded-md bg-pink-300 px-4 py-4 text-base font-semibold tracking-tight shadow-sm hover:bg-pink-300/75 focus:outline focus:outline-2 focus:outline-pink-400 focus-visible:outline-2 focus-visible:outline-offset-2 active:bg-pink-400 dark:bg-pink-800 dark:active:bg-pink-700"

  return (
    <div
      id={item.id}
      ref={setNodeRef}
      style={style}
      onClick={() => onClick(item)}
      className="flex w-full cursor-pointer items-center rounded-md bg-pink-300 text-base font-semibold tracking-tight shadow-sm"
      {...attributes}
    >
      <button className="grow  text-left px-4 py-4">{item.name}</button>
      <button className="px-4 py-4" {...listeners}>
        <DragIcon />
      </button>
    </div>
  );
}

function DndList({ data }: { data: TodoList }) {
  const [items, setItems] = useState(data.items);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id == active.id);
        const newIndex = items.findIndex((item) => item.id == over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function handleItemClick(event: TodoItem) {
    setItems((items) => {
      const oldIndex = items.findIndex((item) => item.id == event.id);
      return arrayMove(items, oldIndex, items.length - 1);
    });
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <h2 className="grow text-2xl font-bold tracking-tight text-gray-700/75 dark:text-gray-300/75">
          {data.title}
        </h2>
        <button className="hover:text-pink-300/75 active:text-pink-400">
          <PlusIcon />
          <span className="sr-only">Add item to {data.title}</span>
        </button>
        <AlertDialog>
          <AlertDialogTrigger className="hover:text-pink-300/75 active:text-pink-400">
            <TrashIcon />
            <span className="sr-only">Delete {data.title}</span>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {data.title}?</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col items-start space-y-3">
              {items.map((item) => (
                <Item key={item.id} item={item} onClick={handleItemClick} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

export default function Home() {
  const [data] = useState(defaultData);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="mb-8 flex flex-col space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Cycle • List
          </h1>
          <p className="text-xl">Keeping track of life's cyclical activities</p>
        </div>
        {data.map((x) => (
          <DndList key={x.title} data={x} />
        ))}
      </main>
    </>
  );
}
