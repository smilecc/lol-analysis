struct SimpleLogger;
use log::{Level, LevelFilter, Metadata, Record};

impl log::Log for SimpleLogger {
    fn enabled(&self, metadata: &Metadata) -> bool {
        metadata.level() <= Level::Info
    }

    fn log(&self, record: &Record) {
        if self.enabled(record.metadata()) {
            println!("{} - {}", record.level(), record.args());
        }
    }

    fn flush(&self) {}
}

static LOGGER: SimpleLogger = SimpleLogger;

pub fn init_logger() {
    #[allow(unused_must_use)]
    {
        log::set_logger(&LOGGER).map(|()| log::set_max_level(LevelFilter::Info));
    }
}
