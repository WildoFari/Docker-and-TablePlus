
import prisma from '@/lib/prisma';
import { Todo } from '@prisma/client';
import { NextResponse, NextRequest } from 'next/server';
import * as yup from 'yup';

// Define la interfaz de params como promesa
interface Segments {
  params: Promise<{
    id: string;
  }>;
}

// Función para obtener un todo por ID
const getTodo = async (id: string): Promise<Todo | null> => {
  const todo = await prisma.todo.findFirst({ where: { id } });
  return todo;
};

// Handler para el método GET
export async function GET(request: Request, { params }: Segments) {
  const { id } = await params; // Resuelve la promesa de params

  const todo = await getTodo(id);

  if (!todo) {
    return NextResponse.json({ message: `Todo con id ${id} no encontrado` }, { status: 404 });
  }

  return NextResponse.json(todo);
}

// Esquema de validación para PUT
const putSchema = yup.object({
  complete: yup.boolean().optional(),
  description: yup.string().optional(),
});

// Handler para el método PUT
export async function PUT(request: Request, { params }: Segments) {
  const { id } = await params; // Resuelve la promesa de params

  const todo = await getTodo(id);

  if (!todo) {
    return NextResponse.json({ message: `Todo con id ${id} no existe` }, { status: 404 });
  }

  try {
    // Valida el cuerpo del request
    const { complete, description } = await putSchema.validate(await request.json());

    // Actualiza el todo en la base de datos
    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: { complete, description },
    });

    return NextResponse.json(updatedTodo);

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Unknown error occurred' }, { status: 400 });
  }
}
