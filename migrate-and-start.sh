#!/bin/bash

bunx prisma generate
bunx prisma db push
bun start