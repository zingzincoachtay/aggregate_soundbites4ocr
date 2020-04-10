#!/usr/local/bin/perl
use strict;
use warnings;
use lib './';
use aggregated;
use statistics;

my $soundbites = Phrases->new ([0,1,2,3]);
my $quantified = Quantifiable->new;
print $_ foreach keys %{$soundbites->{_exclusions}};

my $nontrivial = $soundbites->aggregateBuffer($soundbites);
