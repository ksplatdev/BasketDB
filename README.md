# BasketDB

Fast, Scalable, Extremely-Small, Open-Source, NodeJS Database for all use-cases.

## Features

- Basket -> Bag -> Task System
  - Baskets (Databases) can be "splintered" into multiple Bags to handle tasks
    - This allows for easy scaling
  - Tasks are smartly assigned to Bags (Nodes) to handle a task (ie: search, add, remove, etc...)
- Fast Serialization & Deserialization
  - Uses Chrome V8 Serialization & Deserialization to store information
- Efficient Read & Write
  - Read and Write calls must be called manually to prevent useless calls
  - Data is stored in memory until a read call overwrites memory or a write call writes to database
- Flexible & Schemas
  - With the use of typescript, the database(s) will always have a structure
- Performant
  - The Basket -> Bag -> Task System allows for extremely fast tasks to be run
- Small
  - BasketDB comes in at a very small package size
- Written in TypeScript
  - Builtin typedefs
  - Less common for bugs

## Download
