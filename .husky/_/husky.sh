#!/bin/sh

# Minimal Husky helper sourced by hooks to ensure local binaries resolve.
export PATH="$(pwd)/node_modules/.bin:$PATH"
