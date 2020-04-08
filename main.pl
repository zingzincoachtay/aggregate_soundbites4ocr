#!/usr/local/bin/perl
use strict;
use warnings;
#push(@INC, '/User/tay/Documents/aggregate_soundbites4ocr');
use lib './';
use aggregated;
#var stat = require('./statistics');

my $soundbites = Phrases->new ([0,1,2,3]);
#my $quantified = Quantifiable->new;
print $_ foreach keys %{$soundbites->{_exclusions}};
