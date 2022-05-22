import mongoose from 'mongoose';

const subTaskSchema = new mongoose.Schema({
        name: {
            type: mongoose.SchemaTypes.String,
            required: true,
            minlength: [
                5,
                'Subtask name must be at least 5 characters long, got {VALUE}',
            ],
            maxlength: [
                50,
                'Subtask name must be at most 50 characters long, got {VALUE}',
            ],
            alias: 'subTaskName',
        },
        subtaskStatus: {
            type: mongoose.SchemaTypes.Boolean,
            default: false,
        },
    }),
    todoSchema = new mongoose.Schema({
        taskName: {
            type: mongoose.SchemaTypes.String,
            required: true,
            minlength: [
                5,
                'Task name must be at least 5 characters long, got {VALUE}',
            ],
            maxlength: [
                50,
                'Task name must be at most 50 characters long, got {VALUE}',
            ],
        },
        taskDueDate: {
            type: mongoose.SchemaTypes.Date,
            required: false,
        },
        subTasks: {
            type: [subTaskSchema],
            default: [],
        },
        taskStatus: {
            type: mongoose.SchemaTypes.Boolean,
            default: false,
        },
        taskPriority: {
            type: mongoose.SchemaTypes.Number,
            default: 1,
            max: [5, 'Task priority must be at most 5, got {VALUE}'],
            min: [1, 'Task priority must be at least 1, got {VALUE}'],
        },
        taskAuthor: {
            type: mongoose.ObjectId,
            required: true,
        },
        taskAssignedTo: {
            type: mongoose.ObjectId,
            required: false,
        },
    });
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        match: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    classes: {
        type: [mongoose.SchemaTypes.ObjectId],
        required: true,
        default: [],
        ref: 'Class',
    },
    avatar: {
        type: String,
        default:
            'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
        maxlength: 255,
        match: /([a-z\-_0-9/:.]*\.(jpg|jpeg|png|gif))/i,
    },
    role: {
        type: String,
        default: 'free',
        enum: {
            values: ['free', 'student', 'teacher', 'admin'],
            message: 'Invalid role',
        },
    },
    gameId: {
        type: mongoose.ObjectId,
        default: null,
    },
    progress: {
        todo: { type: [todoSchema], default: [] },
        flashcardStats: [
            {
                studysetId: {
                    type: mongoose.Types.ObjectId,
                    required: [true, 'Flashcard ID is required'],
                },
                flashcardData: [
                    {
                        flashcardId: {
                            type: mongoose.ObjectId,
                            required: [true, 'Flashcard ID is required'],
                        },
                        score: {
                            type: Number,
                            required: [true, 'Score is required'],
                        },
                    },
                ],
            },
        ],
    },
});

userSchema
    .virtual('addClass')
    .get(function () {
        return this.classes.map((classId) => {
            return classId.toString();
        });
    })
    .set(function (classId) {
        this.classes.push(classId);
    });

userSchema.virtual('flashcardProgress').set((score) => {
    this.progress.flashcardStats.push(score);
});

userSchema
    .virtual('todo')
    .get(function () {
        return this.progress.todo;
    })
    .set(function (todo) {
        if (Array.isArray(todo))
            todo.forEach((todo) => this.progress.todo.unshift(todo));
        else this.progress.todo.unshift(todo);
    });

todoSchema.virtual('edit').set(function (todo) {
    this.taskName = todo.taskName;
    this.taskDueDate = todo.taskDueDate;
    this.subTasks = todo.subTasks;
    this.taskStatus = todo.taskStatus;
    this.taskPriority = todo.taskPriority;
    this.taskAssignedTo = todo.taskAssignedTo;
});

todoSchema.virtual('status').set(function (status) {
    this.taskStatus = status;
    if (status) {
        this.subTasks.forEach((subTask) => {
            subTask.subtaskStatus = status;
        });
    }
});

export default mongoose.model('Users', userSchema);
