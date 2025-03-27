#!/bin/bash

tmux new-session -d -s mysession
tmux send-keys -t mysession 'cd app/api && python3 api.py' C-m
tmux split-window -h
tmux send-keys -t mysession 'cd app/back && npm start' C-m
tmux split-window -v
tmux send-keys -t mysession 'cd app/front && npm start' C-m
tmux attach -t mysession
